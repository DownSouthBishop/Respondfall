import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/twilio/validate';
import { createServerClient } from '@/lib/supabase/server';
import { classifyIntent } from '@/lib/claude/classify';
import { sendSMS } from '@/lib/twilio/sms';

const TWIML_EMPTY = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
const STOP_WORDS = new Set(['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']);

export async function POST(req: NextRequest) {
  const url = req.url;
  const signature = req.headers.get('x-twilio-signature') ?? '';
  const rawBody = await req.text();
  const params = Object.fromEntries(new URLSearchParams(rawBody));

  if (process.env.NODE_ENV === 'production' && !validateTwilioSignature(url, params, signature)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const fromPhone = params.From;
  const toPhone = params.To;
  const messageBody = (params.Body ?? '').trim();

  const supabase = createServerClient();

  if (STOP_WORDS.has(messageBody.toUpperCase())) {
    await supabase.from('sms_messages').insert({
      from_phone: fromPhone,
      to_phone: toPhone,
      body: messageBody,
      direction: 'inbound',
      opted_out: true,
    });
    return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } });
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id, business_name, booking_link, sms_blackout_start, sms_blackout_end')
    .eq('twilio_number', toPhone)
    .single();

  if (!customer) {
    return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } });
  }

  await supabase.from('sms_messages').insert({
    customer_id: customer.id,
    from_phone: fromPhone,
    to_phone: toPhone,
    body: messageBody,
    direction: 'inbound',
  });

  const { data: history } = await supabase
    .from('sms_messages')
    .select('body, direction')
    .eq('customer_id', customer.id)
    .or(`from_phone.eq.${fromPhone},to_phone.eq.${fromPhone}`)
    .order('created_at', { ascending: true })
    .limit(20);

  const messages = (history ?? []).map(m => ({
    role: (m.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.body as string,
  }));

  const aiReply = await classifyIntent(customer.business_name, customer.booking_link ?? '', messages);

  if (aiReply) {
    await sendSMS(toPhone, fromPhone, aiReply);
    await supabase.from('sms_messages').insert({
      customer_id: customer.id,
      from_phone: toPhone,
      to_phone: fromPhone,
      body: aiReply,
      direction: 'outbound',
      ai_generated: true,
    });
  }

  return new NextResponse(TWIML_EMPTY, { headers: { 'Content-Type': 'text/xml' } });
}
