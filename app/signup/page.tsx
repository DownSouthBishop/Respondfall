'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const T = '#00b4d8';
const BG = '#0d1117';
const CARD = '#161b22';
const BORDER = '#30363d';
const MUTED = '#8b949e';
const FG = '#e6edf3';

interface StepData {
  email: string;
  password: string;
  full_name: string;
  business_name: string;
  business_phone: string;
  plan: string;
}

const PLANS = [
  { id: 'starter', label: 'Starter', price: '$97/mo', features: ['Up to 3 clients', 'Booking recovery SMS', 'AI intent classification'] },
  { id: 'pro', label: 'Pro', price: '$247/mo', features: ['Up to 10 clients', 'All Starter features', 'Review & referral sequences', 'Analytics dashboard'] },
  { id: 'agency', label: 'Agency', price: '$497/mo', features: ['Unlimited clients', 'All Pro features', 'White-label reporting', 'Priority support'] },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StepData>({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
    business_phone: '',
    plan: 'pro',
  });

  function update(key: keyof StepData, value: string) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  function validateStep1() {
    if (!data.full_name.trim()) return 'Full name is required';
    if (!data.email.trim() || !data.email.includes('@')) return 'Valid email is required';
    if (data.password.length < 8) return 'Password must be at least 8 characters';
    return '';
  }

  function validateStep2() {
    if (!data.business_name.trim()) return 'Business name is required';
    return '';
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Signup failed');
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    color: FG,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: 12,
    fontWeight: 600 as const,
    color: MUTED,
    marginBottom: 6,
    letterSpacing: 0.5,
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C9 2 6 4 5 7L3 15l3-1 1 3 5-3 5 3 1-3 3 1-2-8c-1-3-4-5-7-5z" fill={T} />
          <circle cx="9" cy="10" r="1.5" fill={BG} />
          <circle cx="15" cy="10" r="1.5" fill={BG} />
        </svg>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1.5, color: FG }}>RESPONDFALL</div>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>MISSED CALL REVENUE RECOVERY</div>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {[1, 2, 3].map((n, i) => (
          <>
            <div
              key={n}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: step >= n ? T : CARD,
                border: `2px solid ${step >= n ? T : BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: step >= n ? '#000' : MUTED,
              }}
            >
              {step > n ? '✓' : n}
            </div>
            {i < 2 && (
              <div
                key={`line-${n}`}
                style={{ width: 48, height: 2, background: step > n ? T : BORDER }}
              />
            )}
          </>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, width: 144, justifyContent: 'space-between' }}>
        {['Account', 'Business', 'Plan'].map((label, i) => (
          <div key={label} style={{ fontSize: 10, color: step >= i + 1 ? T : MUTED, fontWeight: 600, textAlign: 'center', width: 48 }}>{label}</div>
        ))}
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 440, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '28px 32px' }}>

        {error && (
          <div style={{ padding: '10px 12px', background: '#ff000022', border: '1px solid #ff000044', borderRadius: 6, color: '#ff6b6b', fontSize: 13, marginBottom: 20 }}>{error}</div>
        )}

        {/* Step 1: Account */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Create your account</div>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={data.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Jane Smith" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={data.email} onChange={e => update('email', e.target.value)} placeholder="jane@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={data.password} onChange={e => update('password', e.target.value)} placeholder="Min 8 characters" style={inputStyle} />
            </div>
            <button
              onClick={() => { const err = validateStep1(); if (err) { setError(err); return; } setError(''); setStep(2); }}
              style={{ padding: '11px', background: T, border: 'none', borderRadius: 6, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 4 }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Business */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Your business info</div>
            <div>
              <label style={labelStyle}>Business Name</label>
              <input type="text" value={data.business_name} onChange={e => update('business_name', e.target.value)} placeholder="Premier Plumbing Co." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Business Phone (optional)</label>
              <input type="tel" value={data.business_phone} onChange={e => update('business_phone', e.target.value)} placeholder="+15551234567" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setError(''); setStep(1); }} style={{ flex: 1, padding: '11px', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 14, cursor: 'pointer' }}>Back</button>
              <button
                onClick={() => { const err = validateStep2(); if (err) { setError(err); return; } setError(''); setStep(3); }}
                style={{ flex: 2, padding: '11px', background: T, border: 'none', borderRadius: 6, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Plan */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Choose your plan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => update('plan', plan.id)}
                  style={{
                    padding: '14px 16px',
                    background: data.plan === plan.id ? `${T}18` : BG,
                    border: `2px solid ${data.plan === plan.id ? T : BORDER}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: FG }}>{plan.label}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: data.plan === plan.id ? T : MUTED }}>{plan.price}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: data.plan === plan.id ? T : MUTED }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => { setError(''); setStep(2); }} style={{ flex: 1, padding: '11px', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 14, cursor: 'pointer' }}>Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex: 2, padding: '11px', background: T, border: 'none', borderRadius: 6, color: '#000', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Creating account…' : 'Start Free Trial'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: MUTED, textAlign: 'center' }}>14-day free trial · No credit card required</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: MUTED }}>Already have an account? <a href="/" style={{ color: T, textDecoration: 'none' }}>Sign in</a></div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 8, opacity: 0.6 }}>Powered by SkyforgeAI · Enterprise-Grade Infrastructure</div>
      </div>
    </div>
  );
}
