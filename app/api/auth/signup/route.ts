import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, businessName, businessPhone, tier } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { business_name: businessName, business_phone: businessPhone, tier: tier || 'starter' },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.session) {
    const response = NextResponse.json({ ok: true });
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    });
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
    });
    return response;
  }

  return NextResponse.json({ ok: true, emailConfirmationRequired: true });
}
