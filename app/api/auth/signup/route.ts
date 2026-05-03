import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { businessName, businessPhone, ownerEmail, tier, password } = await request.json();

    if (!businessName || !businessPhone || !ownerEmail || !tier || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabase
      .from('customers')
      .select('id')
      .eq('email', ownerEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const respondNumber = `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;

    const { data: customer, error } = await supabase
      .from('customers')
      .insert([{
        business_name: businessName,
        original_phone: businessPhone,
        respond_number: respondNumber,
        email: ownerEmail,
        tier: tier,
        password: password,
        trial_starts: new Date().toISOString(),
        trial_ends: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    await fetch(process.env.N8N_TWILIO_PROVISION_WEBHOOK || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer[0].id,
        businessName: businessName,
        originalPhone: businessPhone,
        respondNumber: respondNumber,
        email: ownerEmail
      })
    }).catch(err => console.error('N8n webhook failed:', err));

    await supabase
      .from('audit_log')
      .insert([{
        customer_id: customer[0].id,
        action: 'account_created',
        tier: tier,
        timestamp: new Date().toISOString()
      }]);

    return NextResponse.json({
      success: true,
      customerId: customer[0].id,
      respondNumber: respondNumber,
      trialEnds: customer[0].trial_ends
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
