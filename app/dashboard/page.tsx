'use client';

import React, { useState } from 'react';
import { LogOut, Copy, Check, Star, ChevronRight } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────
interface Client {
  id: string;
  name: string;
  phone: string;
  respondNumber: string;
}

type DashTab = 'activity' | 'inbox' | 'sequences' | 'analytics' | 'settings' | 'connect';
type ConnectPlatform = 'iphone' | 'android' | 'google';

// ── Mock Data ─────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  { id: '1', name: 'Miami Plumbing Co.', phone: '+1 (305) 555-9999', respondNumber: '+1 (305) 555-0100' },
  { id: '2', name: 'South Beach HVAC', phone: '+1 (786) 555-0203', respondNumber: '+1 (786) 555-0200' },
];

const ACTIVITY: { id: number; type: 'missed' | 'sent' | 'received'; caller: string; detail: string; time: string }[] = [
  { id: 1, type: 'missed', caller: 'John D. · (305) 867-5309', detail: 'Recovery SMS sent immediately', time: '2:45 PM' },
  { id: 2, type: 'sent', caller: 'Sarah M. · (786) 234-5678', detail: 'Step 2 follow-up: "Still interested in getting a quote?"', time: '2:43 PM' },
  { id: 3, type: 'received', caller: 'Mike R. · (305) 345-6789', detail: '"Yes I need you to fix my AC asap"', time: '2:31 PM' },
  { id: 4, type: 'missed', caller: 'Lisa T. · (954) 456-7890', detail: 'Recovery SMS sent immediately', time: '1:23 PM' },
  { id: 5, type: 'sent', caller: 'James K. · (305) 567-8901', detail: 'Step 1 recovery: "Hey, we missed your call…"', time: '12:15 PM' },
  { id: 6, type: 'received', caller: 'Anna P. · (786) 678-9012', detail: '"What are your rates for water heater replacement?"', time: '11:42 AM' },
  { id: 7, type: 'missed', caller: 'Tom B. · (305) 789-0123', detail: 'Recovery SMS sent immediately', time: '10:30 AM' },
  { id: 8, type: 'sent', caller: 'Carol W. · (786) 890-1234', detail: 'Step 3 final: "Last chance to lock in your spot…"', time: '9:15 AM' },
];

const CONVOS = [
  {
    id: '1', name: 'Mike R.', phone: '(305) 345-6789',
    preview: '"Yes I need you to fix my AC asap"', time: '2:31 PM', unread: 2,
    messages: [
      { id: 1, from: 'ai', text: "Hi! This is Miami Plumbing Co. — you just tried to reach us but we missed your call. We'd love to help! What's going on?", time: '2:30 PM' },
      { id: 2, from: 'customer', text: 'Yes I need you to fix my AC asap', time: '2:31 PM' },
      { id: 3, from: 'ai', text: "Absolutely — we can get someone out to you today or tomorrow. What's the issue you're experiencing?", time: '2:31 PM' },
      { id: 4, from: 'customer', text: "It's not blowing cold air and making a weird noise", time: '2:32 PM' },
    ],
  },
  {
    id: '2', name: 'Anna P.', phone: '(786) 678-9012',
    preview: '"What are your rates for water heater…"', time: '11:42 AM', unread: 0,
    messages: [
      { id: 1, from: 'ai', text: "Hi! This is Miami Plumbing Co. — you just tried to reach us. How can we help?", time: '11:40 AM' },
      { id: 2, from: 'customer', text: 'What are your rates for water heater replacement?', time: '11:42 AM' },
      { id: 3, from: 'ai', text: "Great question! Our water heater replacement starts at $800 including parts & labor. Want to schedule a free estimate?", time: '11:42 AM' },
    ],
  },
  {
    id: '3', name: 'Carol W.', phone: '(786) 890-1234',
    preview: 'Final follow-up sent', time: '9:15 AM', unread: 0,
    messages: [
      { id: 1, from: 'ai', text: "Hi! This is Miami Plumbing Co. — you tried to reach us earlier. We'd love to help!", time: '8:55 AM' },
      { id: 2, from: 'ai', text: 'Just checking back in — are you still looking for a plumber? We have openings this week!', time: '10:55 AM' },
      { id: 3, from: 'ai', text: 'Last chance to lock in your appointment — our schedule fills up fast. Text back anytime.', time: '9:15 AM' },
    ],
  },
];

// ── Color tokens ──────────────────────────────────────────────────────
const C = {
  bg: '#0d1117',
  card: '#161b22',
  border: '#30363d',
  teal: '#00b4d8',
  orange: '#f97316',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#a855f7',
  amber: '#f59e0b',
  textPrimary: '#f0f6fc',
  textSecondary: '#8b949e',
  textMuted: '#484f58',
} as const;

// ── Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeClient, setActiveClient] = useState<Client>(CLIENTS[0]);
  const [tab, setTab] = useState<DashTab>('activity');
  const [activeConvo, setActiveConvo] = useState(CONVOS[0]);
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<ConnectPlatform>('iphone');
  const [smsTemplate, setSmsTemplate] = useState(
    "Hi! This is {business_name} — you just tried to reach us but we missed your call. We'd love to help! Reply here or book at {booking_link}. Reply STOP to opt out."
  );
  const [blackoutStart, setBlackoutStart] = useState('22:00');
  const [blackoutEnd, setBlackoutEnd] = useState('07:00');
  const [bookingLink, setBookingLink] = useState('https://calendly.com/miami-plumbing');
  const [reviewLink, setReviewLink] = useState('https://g.page/r/miami-plumbing');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const stats = { missedToday: 4, smsSentToday: 9, missed30Days: 47, revenueProtected: 14100 };

  const copyNumber = () => {
    navigator.clipboard.writeText(activeClient.respondNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const TABS: { key: DashTab; label: string; badge?: number }[] = [
    { key: 'activity', label: 'Activity' },
    { key: 'inbox', label: 'Inbox', badge: 2 },
    { key: 'sequences', label: 'Sequences' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
    { key: 'connect', label: 'Connect' },
  ];

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '14px 18px',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    color: active ? C.teal : C.textSecondary,
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${C.teal}` : '2px solid transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '-1px',
    whiteSpace: 'nowrap' as const,
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: C.bg,
    border: `1px solid ${C.border}`,
    color: C.textPrimary,
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  };

  const saveBtnStyle: React.CSSProperties = {
    marginTop: '16px',
    padding: '8px 20px',
    backgroundColor: C.teal,
    color: C.bg,
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: C.bg, color: C.textPrimary }}>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside style={{ width: '220px', flexShrink: 0, backgroundColor: C.card, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.12em', color: C.textPrimary }}>RESPONDFALL</div>
          <div style={{ fontSize: '10px', color: C.teal, letterSpacing: '0.1em', marginTop: '3px' }}>BY SKYFORGEAI</div>
        </div>

        {/* Client list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <div style={{ padding: '4px 16px 8px', fontSize: '10px', color: C.textMuted, letterSpacing: '0.12em', fontWeight: '600' }}>CLIENT ACCOUNTS</div>
          {CLIENTS.map(client => {
            const active = activeClient.id === client.id;
            return (
              <button
                key={client.id}
                onClick={() => setActiveClient(client)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', background: active ? `${C.teal}18` : 'none',
                  border: 'none', borderLeft: active ? `2px solid ${C.teal}` : '2px solid transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: active ? C.teal : '#30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: active ? C.bg : C.textPrimary, flexShrink: 0 }}>
                  {client.name[0]}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
                  <div style={{ fontSize: '11px', color: C.textSecondary }}>{client.phone}</div>
                </div>
              </button>
            );
          })}
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: '13px' }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Add Client
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: C.textPrimary }}>Agency Owner</div>
          <div style={{ fontSize: '11px', color: C.teal, marginBottom: '12px' }}>SkyforgeAI Partner</div>
          <button
            onClick={() => { window.location.href = '/api/auth/signout'; }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: C.textMuted, fontSize: '12px', cursor: 'pointer', padding: 0 }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Client header */}
        <div style={{ padding: '18px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '19px', fontWeight: '700', margin: 0 }}>{activeClient.name}</h1>
            <div style={{ fontSize: '12px', color: C.textSecondary, marginTop: '3px' }}>
              <span style={{ color: C.teal }}>{activeClient.respondNumber}</span>
              <span style={{ margin: '0 6px', color: C.textMuted }}>·</span>
              <span>Respondfall AI Active</span>
            </div>
          </div>
          <span style={{ backgroundColor: `${C.green}20`, border: `1px solid ${C.green}`, color: C.green, fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: '20px' }}>
            SYSTEM ACTIVE
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {[
            { label: 'MISSED TODAY', value: String(stats.missedToday), sub: 'Captured & sequenced', color: C.textPrimary },
            { label: 'SMS SENT TODAY', value: String(stats.smsSentToday), sub: 'All sequence steps', color: C.textPrimary },
            { label: 'MISSED · 30 DAYS', value: String(stats.missed30Days), sub: '89 SMS total', color: C.textPrimary },
            { label: 'REVENUE PROTECTED', value: `$${stats.revenueProtected.toLocaleString()}`, sub: `${stats.missed30Days} × $300`, color: C.orange },
          ].map((s, i) => (
            <div key={i} style={{ backgroundColor: C.card, padding: '18px 22px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: '10px', color: C.textMuted, letterSpacing: '0.1em', fontWeight: '600', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '30px', fontWeight: '700', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: C.textSecondary, marginTop: '5px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, backgroundColor: C.card, padding: '0 28px', flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={tabBtnStyle(tab === t.key)}>
              {t.label}
              {t.badge ? (
                <span style={{ backgroundColor: C.teal, color: C.bg, fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px', lineHeight: 1.4 }}>{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* ── ACTIVITY ─────────────────────────────────────────── */}
          {tab === 'activity' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Live Activity Feed</h2>
                <span style={{ fontSize: '12px', color: C.textMuted }}>Today · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {ACTIVITY.map(ev => {
                  const colors = { missed: C.red, sent: C.green, received: C.blue };
                  const labels = { missed: 'MISSED', sent: 'SENT', received: 'RECEIVED' };
                  return (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px', backgroundColor: `${colors[ev.type]}20`, color: colors[ev.type], flexShrink: 0, minWidth: '68px', textAlign: 'center', letterSpacing: '0.05em' }}>
                          {labels[ev.type]}
                        </span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary }}>{ev.caller}</div>
                          <div style={{ fontSize: '12px', color: C.textSecondary, marginTop: '2px' }}>{ev.detail}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: C.textMuted, flexShrink: 0, marginLeft: '16px' }}>{ev.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── INBOX ────────────────────────────────────────────── */}
          {tab === 'inbox' && (
            <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 310px)' }}>
              {/* Convo list */}
              <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                {CONVOS.map(convo => {
                  const active = activeConvo.id === convo.id;
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setActiveConvo(convo)}
                      style={{ width: '100%', padding: '13px 14px', backgroundColor: active ? `${C.teal}15` : C.card, border: `1px solid ${active ? C.teal : C.border}`, borderRadius: '8px', textAlign: 'left', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: C.textPrimary }}>{convo.name}</span>
                        <span style={{ fontSize: '11px', color: C.textMuted }}>{convo.time}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: C.textSecondary, marginBottom: '4px' }}>{convo.phone}</div>
                      <div style={{ fontSize: '12px', color: C.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{convo.preview}</div>
                      {convo.unread > 0 && (
                        <span style={{ display: 'inline-block', marginTop: '6px', backgroundColor: C.teal, color: C.bg, fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '10px' }}>
                          {convo.unread} new
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Thread */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{activeConvo.name}</div>
                    <div style={{ fontSize: '12px', color: C.textSecondary }}>{activeConvo.phone} · AI Handling</div>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: `${C.amber}20`, border: `1px solid ${C.amber}`, borderRadius: '8px', color: C.amber, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    <Star size={13} /> Mark Job Complete
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeConvo.messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'ai' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '10px 14px',
                        borderRadius: msg.from === 'ai' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: msg.from === 'ai' ? `${C.teal}22` : '#21262d',
                        border: `1px solid ${msg.from === 'ai' ? C.teal + '44' : C.border}`,
                        fontSize: '13px', color: C.textPrimary, lineHeight: 1.5,
                      }}>
                        {msg.text}
                        <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '4px', textAlign: 'right' }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.border}`, backgroundColor: `${C.teal}08`, fontSize: '11px', color: C.teal }}>
                  🤖 AI is handling this conversation automatically
                </div>
              </div>
            </div>
          )}

          {/* ── SEQUENCES ────────────────────────────────────────── */}
          {tab === 'sequences' && (
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', margin: '0 0 20px' }}>Automation Sequences</h2>

              {/* Booking Flow */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '700' }}>📞 Booking Flow</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textSecondary }}>Trigger: Missed call detected</p>
                  </div>
                  <span style={{ backgroundColor: `${C.green}20`, border: `1px solid ${C.green}`, color: C.green, fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[
                    { step: 1, delay: '5 sec', msg: 'Recovery SMS with booking link' },
                    { step: 2, delay: '2 hrs', msg: 'Follow-up if no reply' },
                    { step: 3, delay: '24 hrs', msg: 'Final attempt' },
                  ].map((s, i) => (
                    <React.Fragment key={s.step}>
                      <div style={{ flex: 1, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: C.teal, fontWeight: '600', marginBottom: '4px' }}>Step {s.step} · {s.delay}</div>
                        <div style={{ fontSize: '12px', color: C.textSecondary }}>{s.msg}</div>
                      </div>
                      {i < 2 && <ChevronRight size={15} color={C.textMuted} style={{ flexShrink: 0 }} />}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '28px', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
                  <div><span style={{ fontSize: '22px', fontWeight: '700' }}>47</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>sequences started</span></div>
                  <div><span style={{ fontSize: '22px', fontWeight: '700', color: C.green }}>68%</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>reply rate</span></div>
                  <div><span style={{ fontSize: '22px', fontWeight: '700', color: C.orange }}>$14,100</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>revenue protected</span></div>
                </div>
              </div>

              {/* Review Flow */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>⭐ Review Flow</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textSecondary }}>Trigger: Mark Job Complete</p>
                  </div>
                  <span style={{ backgroundColor: `${C.green}20`, border: `1px solid ${C.green}`, color: C.green, fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>ACTIVE</span>
                </div>
                <div style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: C.amber, fontWeight: '600', marginBottom: '4px' }}>Step 1 · 2 hrs after job complete</div>
                  <div style={{ fontSize: '12px', color: C.textSecondary }}>Google review request SMS with direct review link</div>
                </div>
                <div style={{ display: 'flex', gap: '28px', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
                  <div><span style={{ fontSize: '22px', fontWeight: '700' }}>31</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>sent</span></div>
                  <div><span style={{ fontSize: '22px', fontWeight: '700', color: C.amber }}>74%</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>click rate</span></div>
                </div>
              </div>

              {/* Referral Flow */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>🤝 Referral Flow</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: C.textSecondary }}>Trigger: Mark Job Complete</p>
                  </div>
                  <span style={{ backgroundColor: `${C.green}20`, border: `1px solid ${C.green}`, color: C.green, fontSize: '10px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[
                    { step: 1, delay: '30 min', msg: 'Referral ask SMS' },
                    { step: 2, delay: 'On name received', msg: 'Unique REF code issued' },
                  ].map((s, i) => (
                    <React.Fragment key={s.step}>
                      <div style={{ flex: 1, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: C.purple, fontWeight: '600', marginBottom: '4px' }}>Step {s.step} · {s.delay}</div>
                        <div style={{ fontSize: '12px', color: C.textSecondary }}>{s.msg}</div>
                      </div>
                      {i < 1 && <ChevronRight size={15} color={C.textMuted} style={{ flexShrink: 0 }} />}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '28px', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
                  <div><span style={{ fontSize: '22px', fontWeight: '700' }}>18</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>referrals requested</span></div>
                  <div><span style={{ fontSize: '22px', fontWeight: '700', color: C.purple }}>7</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>codes issued</span></div>
                  <div><span style={{ fontSize: '22px', fontWeight: '700', color: C.green }}>3</span> <span style={{ fontSize: '12px', color: C.textSecondary }}>converted</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ────────────────────────────────────────── */}
          {tab === 'analytics' && (
            <div>
              {/* Revenue hero */}
              <div style={{ ...cardStyle, textAlign: 'center', padding: '36px 24px' }}>
                <div style={{ fontSize: '11px', color: C.textMuted, letterSpacing: '0.12em', marginBottom: '10px' }}>REVENUE PROTECTED</div>
                <div style={{ fontSize: '60px', fontWeight: '800', color: C.orange, lineHeight: 1 }}>
                  ${stats.revenueProtected.toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: C.textSecondary, marginTop: '10px' }}>
                  {stats.missed30Days} missed calls × $300 avg job value · last 30 days
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'REPLY RATE', value: '68%', color: C.green, sub: '32 of 47 sequences replied' },
                  { label: 'BOOKING RATE', value: '43%', color: C.teal, sub: '14 appointments booked' },
                  { label: 'REVIEW RATE', value: '74%', color: C.amber, sub: '23 of 31 clicked review link' },
                ].map((s, i) => (
                  <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
                    <div style={{ fontSize: '10px', color: C.textMuted, letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: C.textSecondary, marginTop: '4px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* TCPA + Health */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600' }}>TCPA Compliance</h3>
                  {[
                    { label: 'Opt-outs honored', value: '100%' },
                    { label: 'Blackout hours respected', value: '✓' },
                    { label: 'STOP processing', value: '< 5 min' },
                    { label: 'First message opt-out', value: '✓ Included' },
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: '13px' }}>
                      <span style={{ color: C.textSecondary }}>{item.label}</span>
                      <span style={{ color: C.green, fontWeight: '600' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600' }}>System Health</h3>
                  {[
                    { label: 'Twilio Webhook', value: 'Connected' },
                    { label: 'SMS Delivery Rate', value: '99.2%' },
                    { label: 'AI Response Time', value: '< 2 sec' },
                    { label: 'Uptime (30 days)', value: '99.9%' },
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: '13px' }}>
                      <span style={{ color: C.textSecondary }}>{item.label}</span>
                      <span style={{ color: C.green, fontWeight: '600' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ─────────────────────────────────────────── */}
          {tab === 'settings' && (
            <div style={{ maxWidth: '620px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 20px' }}>Settings</h2>

              {/* Business Profile */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600' }}>Business Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[{ label: 'Business Name', value: activeClient.name, type: 'text' }, { label: 'Business Phone', value: activeClient.phone, type: 'tel' }].map((f, i) => (
                    <div key={i}>
                      <label style={{ display: 'block', fontSize: '12px', color: C.textSecondary, marginBottom: '6px' }}>{f.label}</label>
                      <input type={f.type} defaultValue={f.value} style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = C.teal)}
                        onBlur={e => (e.target.style.borderColor = C.border)} />
                    </div>
                  ))}
                </div>
                <button onClick={saveSettings} style={saveBtnStyle}>{settingsSaved ? '✓ Saved' : 'Save Changes'}</button>
              </div>

              {/* SMS Config */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600' }}>SMS Configuration</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: C.textSecondary, marginBottom: '6px' }}>Recovery SMS Template</label>
                    <textarea rows={3} value={smsTemplate} onChange={e => setSmsTemplate(e.target.value)}
                      style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                      onFocus={e => (e.target.style.borderColor = C.teal)}
                      onBlur={e => (e.target.style.borderColor = C.border)} />
                    <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px' }}>Variables: {'{{business_name}}'}, {'{{booking_link}}'}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{ label: 'Blackout Start', val: blackoutStart, set: setBlackoutStart }, { label: 'Blackout End', val: blackoutEnd, set: setBlackoutEnd }].map((f, i) => (
                      <div key={i}>
                        <label style={{ display: 'block', fontSize: '12px', color: C.textSecondary, marginBottom: '6px' }}>{f.label}</label>
                        <input type="time" value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={saveSettings} style={saveBtnStyle}>{settingsSaved ? '✓ Saved' : 'Save Changes'}</button>
              </div>

              {/* Links */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '600' }}>Links</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[{ label: 'Booking Link', val: bookingLink, set: setBookingLink }, { label: 'Google Review Link', val: reviewLink, set: setReviewLink }].map((f, i) => (
                    <div key={i}>
                      <label style={{ display: 'block', fontSize: '12px', color: C.textSecondary, marginBottom: '6px' }}>{f.label}</label>
                      <input type="url" value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = C.teal)}
                        onBlur={e => (e.target.style.borderColor = C.border)} />
                    </div>
                  ))}
                </div>
                <button onClick={saveSettings} style={saveBtnStyle}>{settingsSaved ? '✓ Saved' : 'Save Changes'}</button>
              </div>

              {/* Danger zone */}
              <div style={{ backgroundColor: `${C.red}10`, border: `1px solid ${C.red}40`, borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: C.red }}>Danger Zone</h3>
                <p style={{ fontSize: '13px', color: C.textSecondary, marginBottom: '12px' }}>These actions are irreversible.</p>
                <button style={{ padding: '8px 18px', backgroundColor: 'transparent', color: C.red, border: `1px solid ${C.red}`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Delete Client Account
                </button>
              </div>
            </div>
          )}

          {/* ── CONNECT ──────────────────────────────────────────── */}
          {tab === 'connect' && (
            <div style={{ maxWidth: '700px' }}>

              {/* Respondfall Number */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '3px', height: '16px', backgroundColor: C.teal, display: 'inline-block', borderRadius: '2px' }} />
                  Your Respondfall Number
                </h2>
                <div style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: C.teal }}>{activeClient.respondNumber}</div>
                    <div style={{ fontSize: '12px', color: C.textSecondary, marginTop: '4px' }}>Respondfall Infrastructure · Managed for you</div>
                  </div>
                  <button onClick={copyNumber} style={{ padding: '8px 14px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', color: copied ? C.green : C.textPrimary, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Number'}
                  </button>
                </div>
                <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: `${C.teal}10`, border: `1px solid ${C.teal}30`, borderRadius: '8px', fontSize: '13px', color: C.teal }}>
                  <strong>Your Business Number:</strong> {activeClient.phone} → missed calls forward to {activeClient.respondNumber}
                </div>
              </div>

              {/* Call Forwarding Setup */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '3px', height: '16px', backgroundColor: C.teal, display: 'inline-block', borderRadius: '2px' }} />
                  Conditional Call Forwarding Setup
                </h2>
                <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 20px' }}>
                  Your phone still rings normally. <span style={{ color: C.teal }}>Only missed calls forward</span> to your Respondfall number.
                </p>

                {/* Platform selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {([
                    { key: 'iphone', label: 'iPhone', emoji: '🍎' },
                    { key: 'android', label: 'Android', emoji: '🤖' },
                    { key: 'google', label: 'Google Voice', emoji: '🔵' },
                  ] as { key: ConnectPlatform; label: string; emoji: string }[]).map(p => (
                    <button
                      key={p.key}
                      onClick={() => setPlatform(p.key)}
                      style={{ padding: '16px', backgroundColor: platform === p.key ? `${C.teal}20` : C.bg, border: `1px solid ${platform === p.key ? C.teal : C.border}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '26px', marginBottom: '6px' }}>{p.emoji}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: platform === p.key ? C.teal : C.textPrimary }}>{p.label}</div>
                    </button>
                  ))}
                </div>

                {/* iPhone instructions */}
                {platform === 'iphone' && (
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>iPhone Setup (Carrier Code Method)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        "Open your iPhone's Phone app",
                        `Dial: **61*${activeClient.respondNumber.replace(/\D/g, '')}*11*20#`,
                        'Press the green Call button',
                        'You\'ll hear a confirmation tone — setup complete!',
                      ].map((text, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.teal, color: C.bg, fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.5, paddingTop: '2px' }}>{text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: `${C.green}10`, border: `1px solid ${C.green}30`, borderRadius: '8px', fontSize: '12px', color: C.green }}>
                      ✓ To disable: Dial ##61# and press Call
                    </div>
                  </div>
                )}

                {/* Android instructions */}
                {platform === 'android' && (
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Android Setup</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        'Open the Phone app → tap the three-dot menu → Settings',
                        'Tap "Supplementary services" or "Call forwarding"',
                        'Select "Forward when unanswered"',
                        `Enter ${activeClient.respondNumber} and set timeout to 20 seconds`,
                        'Tap Enable — you\'re all set!',
                      ].map((text, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.teal, color: C.bg, fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.5, paddingTop: '2px' }}>{text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: '8px', fontSize: '12px', color: C.blue }}>
                      Note: Steps may vary by manufacturer (Samsung, Pixel, etc.)
                    </div>
                  </div>
                )}

                {/* Google Voice instructions */}
                {platform === 'google' && (
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Google Voice Setup</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        'Log into voice.google.com',
                        'Click the gear icon → Settings → Calls',
                        'Under "Call forwarding", add your linked phones',
                        `Enable "Forward to" and enter ${activeClient.respondNumber}`,
                        'Set ring duration to 20 seconds before forwarding',
                      ].map((text, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: C.teal, color: C.bg, fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.5, paddingTop: '2px' }}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
