'use client';

import React, { useState } from 'react';

type AuthTab = 'signin' | 'signup' | 'magic';

export default function LoginPage() {
  const [tab, setTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMagicSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send magic link.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#0d1117',
    border: '1px solid #30363d',
    color: '#f0f6fc',
    width: '100%',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#8b949e',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    marginBottom: '8px',
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: '#00b4d8',
    color: '#0d1117',
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    border: 'none',
    marginTop: '8px',
  };

  const TABS: { key: AuthTab; label: string }[] = [
    { key: 'signin', label: 'SIGN IN' },
    { key: 'signup', label: 'SIGN UP' },
    { key: 'magic', label: 'MAGIC LINK' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <svg width="72" height="48" viewBox="0 0 72 48" fill="none" style={{ marginBottom: '14px' }}>
            <ellipse cx="20" cy="24" rx="17" ry="11" fill="#00b4d8" opacity="0.9" transform="rotate(-18 20 24)" />
            <ellipse cx="52" cy="24" rx="17" ry="11" fill="#f97316" opacity="0.9" transform="rotate(18 52 24)" />
            <circle cx="36" cy="20" r="6" fill="#ffffff" opacity="0.95" />
            <circle cx="36" cy="20" r="2.5" fill="#0d1117" />
          </svg>
          <h1 style={{ color: '#f0f6fc', fontSize: '26px', fontWeight: '800', letterSpacing: '0.3em', margin: 0 }}>RESPONDFALL</h1>
          <p style={{ color: '#8b949e', fontSize: '10px', letterSpacing: '0.25em', marginTop: '6px' }}>MISSED CALL REVENUE RECOVERY</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '32px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #30363d', marginBottom: '28px' }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); setMagicSent(false); }}
                style={{
                  flex: 1,
                  paddingBottom: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  color: tab === t.key ? '#00b4d8' : '#8b949e',
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t.key ? '2px solid #00b4d8' : '2px solid transparent',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#ef4444', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#00b4d8')}
                  onBlur={e => (e.target.style.borderColor = '#30363d')} />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>PASSWORD</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#00b4d8')}
                  onBlur={e => (e.target.style.borderColor = '#30363d')} />
              </div>
              <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          )}

          {/* SIGN UP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#00b4d8')}
                  onBlur={e => (e.target.style.borderColor = '#30363d')} />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>PASSWORD</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#00b4d8')}
                  onBlur={e => (e.target.style.borderColor = '#30363d')} />
              </div>
              <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              </button>
            </form>
          )}

          {/* MAGIC LINK */}
          {tab === 'magic' && (
            magicSent ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ color: '#22c55e', fontSize: '18px', marginBottom: '10px' }}>✓ Magic link sent!</div>
                <p style={{ color: '#8b949e', fontSize: '13px' }}>Check your email and click the link to sign in.</p>
              </div>
            ) : (
              <form onSubmit={handleMagicLink}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>EMAIL</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#00b4d8')}
                    onBlur={e => (e.target.style.borderColor = '#30363d')} />
                </div>
                <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'SENDING...' : 'SEND MAGIC LINK'}
                </button>
              </form>
            )
          )}

        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#484f58', marginTop: '24px' }}>
          Powered by <span style={{ color: '#00b4d8' }}>SkyforgeAI</span> · Enterprise-Grade Infrastructure
        </p>
      </div>
    </div>
  );
}
