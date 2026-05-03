import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilio/validate';
import { createServerClient } from '@/lib/supabase/server';

const TWIML_EMPTY = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

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
    .select('id, business_name')
    .eq('twilio_number', toPhone)
    .single();

  if (customer) {
    await supabase.from('missed_calls').insert({
      customer_id: customer.id,
      caller_phone: callerPhone,
      twilio_number: toPhone,
      called_at: new Date().toISOString(),
    });

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
  }

  return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } });
}
