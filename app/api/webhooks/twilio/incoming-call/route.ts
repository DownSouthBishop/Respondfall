import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilio/validate';
import { createServerClient } from '@/lib/supabase/server';

const TWIML_EMPTY = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

function bookingSMS(step: number, businessName: string, bookingLink: string | null, template: string | null): string {
  if (step === 1) {
    if (template) return template;
    return bookingLink
      ? `Hi! You just missed a call from ${businessName}. We'd love to help — book here: ${bookingLink} Reply STOP to opt out.`
      : `Hi! You just missed a call from ${businessName}. Reply and we'll get right back to you. Reply STOP to opt out.`;
  }
  if (step === 2) {
    return bookingLink
      ? `Still here if you need us! ${businessName} — grab a time: ${bookingLink}`
      : `Just following up — ${businessName} is still ready to help. Reply anytime.`;
  }
  // step 3
  return `Last check-in from ${businessName}. If you still need help, we're here. Have a great day!`;
}

export async function POST(req: NextRequest) {
  const url = req.url;
  const signature = req.headers.get('x-twilio-signature') ?? '';
  const rawBody = await req.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  if (process.env.NODE_ENV === 'production' && !validateTwilioSignature(url, params, signature)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const callerPhone = params.From;
  const toPhone = params.To;

  const supabase = createServerClient();

  const { data: customer } = await supabase
    .from('customers')
    .select('id, business_name, booking_link, sms_template, system_active, blackout_start, blackout_end')
    .eq('twilio_number', toPhone)
    .single();

  if (!customer) {
    return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } });
  }

  // Log missed call
  await supabase.from('missed_calls').insert({
    customer_id: customer.id,
    caller_phone: callerPhone,
    twilio_number: toPhone,
    called_at: new Date().toISOString(),
  });

  // Schedule booking sequence steps 2 and 3 if system is active
  if (customer.system_active) {
    const now = new Date();

    const step2At = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const step3At = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await supabase.from('scheduled_messages').insert([
      {
        customer_id: customer.id,
        to_phone: callerPhone,
        body: bookingSMS(2, customer.business_name, customer.booking_link, null),
        sequence_type: 'booking',
        step: 2,
        send_at: step2At.toISOString(),
        status: 'pending',
      },
      {
        customer_id: customer.id,
        to_phone: callerPhone,
        body: bookingSMS(3, customer.business_name, customer.booking_link, null),
        sequence_type: 'booking',
        step: 3,
        send_at: step3At.toISOString(),
        status: 'pending',
      },
    ]);
  }

  // Fire n8n non-blocking
  if (process.env.N8N_TWILIO_PROVISION_WEBHOOK) {
    fetch(process.env.N8N_TWILIO_PROVISION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'missed_call',
        customer_id: customer.id,
        business_name: customer.business_name,
        caller_phone: callerPhone,
        twilio_number: toPhone,
      }),
    }).catch(console.error);
  }

  return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } });
}
