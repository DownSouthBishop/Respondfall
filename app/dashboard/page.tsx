'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const T = '#00b4d8';
const BG = '#0d1117';
const CARD = '#161b22';
const BORDER = '#30363d';
const MUTED = '#8b949e';
const FG = '#e6edf3';
const GREEN = '#22c55e';
const ORANGE = '#f97316';

interface Client {
  id: string;
  business_name: string;
  twilio_number: string | null;
  system_active: boolean;
  tier: string;
  job_value: number;
  booking_link: string | null;
  google_review_link: string | null;
  sms_template: string | null;
  blackout_start: number;
  blackout_end: number;
  business_phone: string | null;
}

interface Stats {
  missedToday: number;
  smsSentToday: number;
  missed30Days: number;
  revenueProtected: number;
}

interface ActivityEvent {
  id: string;
  type: string;
  caller_phone?: string;
  direction?: string;
  body?: string;
  created_at: string;
}

interface Conversation {
  phone: string;
  unread: number;
  lastTs: string;
  messages: { id: string; direction: string; body: string; created_at: string }[];
}

const DEMO_CLIENTS: Client[] = [
  { id: 'demo-1', business_name: 'Premier Plumbing Co.', twilio_number: '+15551234567', system_active: true, tier: 'pro', job_value: 280, booking_link: 'https://book.example.com', google_review_link: null, sms_template: null, blackout_start: 22, blackout_end: 7, business_phone: '+15559876543' },
  { id: 'demo-2', business_name: 'Arctic HVAC Services', twilio_number: '+15557654321', system_active: true, tier: 'pro', job_value: 350, booking_link: null, google_review_link: null, sms_template: null, blackout_start: 22, blackout_end: 7, business_phone: '+15550001111' },
];
const DEMO_STATS: Stats = { missedToday: 4, smsSentToday: 12, missed30Days: 89, revenueProtected: 24920 };
const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: '1', type: 'missed_call', caller_phone: '+15559998877', created_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: '2', type: 'sms_sent', direction: 'outbound', body: 'Hi! This is Premier Plumbing. We missed your call…', created_at: new Date(Date.now() - 7 * 60000).toISOString() },
  { id: '3', type: 'sms_received', direction: 'inbound', body: 'Yes please, I need a quote for a leaking pipe.', created_at: new Date(Date.now() - 6 * 60000).toISOString() },
];
const DEMO_CONVOS: Conversation[] = [
  { phone: '+15559998877', unread: 1, lastTs: new Date(Date.now() - 6 * 60000).toISOString(), messages: [
    { id: 'm1', direction: 'outbound', body: 'Hi! We missed your call from Premier Plumbing. Can we help?', created_at: new Date(Date.now() - 7 * 60000).toISOString() },
    { id: 'm2', direction: 'inbound', body: 'Yes, I need a quote for a leaking pipe.', created_at: new Date(Date.now() - 6 * 60000).toISOString() },
  ]},
  { phone: '+15553332244', unread: 0, lastTs: new Date(Date.now() - 3600000).toISOString(), messages: [
    { id: 'm3', direction: 'outbound', body: 'Thanks for calling Premier Plumbing! Book here: https://book.example.com', created_at: new Date(Date.now() - 3600000).toISOString() },
  ]},
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function DashboardPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<Stats>(DEMO_STATS);
  const [activity, setActivity] = useState<ActivityEvent[]>(DEMO_ACTIVITY);
  const [convos, setConvos] = useState<Conversation[]>(DEMO_CONVOS);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(DEMO_CONVOS[0]);
  const [tab, setTab] = useState('activity');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addStep, setAddStep] = useState<'form' | 'provisioning' | 'done'>('form');
  const [addForm, setAddForm] = useState({ business_name: '', business_phone: '', area_code: '', booking_link: '', job_value: '250' });
  const [addError, setAddError] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [jobDone, setJobDone] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ booking_link: '', google_review_link: '', job_value: '', blackout_start: '', blackout_end: '', system_active: true });

  // Load clients
  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const list: Client[] = data.clients ?? [];
        if (list.length) {
          setClients(list);
          setActiveClient(list[0]);
        } else {
          setClients(DEMO_CLIENTS);
          setActiveClient(DEMO_CLIENTS[0]);
        }
      })
      .catch(() => {
        setClients(DEMO_CLIENTS);
        setActiveClient(DEMO_CLIENTS[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load client data when active client changes
  const loadClientData = useCallback((client: Client) => {
    if (client.id.startsWith('demo-')) return;
    Promise.all([
      fetch(`/api/clients/${client.id}/stats`).then(r => r.json()).catch(() => null),
      fetch(`/api/clients/${client.id}/activity`).then(r => r.json()).catch(() => null),
      fetch(`/api/clients/${client.id}/conversations`).then(r => r.json()).catch(() => null),
    ]).then(([s, a, c]) => {
      if (s?.missedToday !== undefined) setStats(s);
      if (a?.events?.length) setActivity(a.events);
      if (c?.conversations?.length) {
        setConvos(c.conversations);
        setActiveConvo(c.conversations[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeClient) return;
    setSettingsForm({
      booking_link: activeClient.booking_link ?? '',
      google_review_link: activeClient.google_review_link ?? '',
      job_value: String(activeClient.job_value),
      blackout_start: String(activeClient.blackout_start),
      blackout_end: String(activeClient.blackout_end),
      system_active: activeClient.system_active,
    });
    setStats(DEMO_STATS);
    setActivity(DEMO_ACTIVITY);
    setConvos(DEMO_CONVOS);
    setActiveConvo(DEMO_CONVOS[0]);
    loadClientData(activeClient);
  }, [activeClient?.id]);

  async function handleLogout() {
    await fetch('/api/auth/signout');
    router.push('/');
  }

  async function handleSaveSettings() {
    if (!activeClient || activeClient.id.startsWith('demo-')) return;
    const res = await fetch(`/api/clients/${activeClient.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_link: settingsForm.booking_link || null,
        google_review_link: settingsForm.google_review_link || null,
        job_value: Number(settingsForm.job_value),
        blackout_start: Number(settingsForm.blackout_start),
        blackout_end: Number(settingsForm.blackout_end),
        system_active: settingsForm.system_active,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setClients(prev => prev.map(c => c.id === activeClient.id ? { ...c, ...data.customer } : c));
      setActiveClient(prev => prev ? { ...prev, ...data.customer } : prev);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    }
  }

  async function handleMarkJobComplete() {
    if (!activeClient || activeClient.id.startsWith('demo-')) return;
    const customerPhone = convos[0]?.phone;
    if (!customerPhone) return;
    const res = await fetch(`/api/clients/${activeClient.id}/complete-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_phone: customerPhone }),
    });
    if (res.ok) {
      setJobDone(true);
      setTimeout(() => setJobDone(false), 4000);
    }
  }

  async function handleAddClient() {
    setAddError('');
    if (!addForm.business_name.trim()) { setAddError('Business name is required'); return; }
    if (!addForm.area_code.match(/^\d{3}$/)) { setAddError('Area code must be 3 digits'); return; }
    setAddStep('provisioning');
    try {
      // Provision number
      const numRes = await fetch('/api/clients/provision-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_code: addForm.area_code }),
      });
      const numData = await numRes.json();
      if (!numRes.ok) throw new Error(numData.error ?? 'Failed to provision number');

      // Create client
      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: addForm.business_name.trim(),
          business_phone: addForm.business_phone.trim() || null,
          twilio_number: numData.phoneNumber,
          twilio_sid: numData.sid,
          booking_link: addForm.booking_link.trim() || null,
          job_value: Number(addForm.job_value) || 250,
        }),
      });
      const clientData = await clientRes.json();
      if (!clientRes.ok) throw new Error(clientData.error ?? 'Failed to create client');

      const newClient: Client = clientData.customer;
      setClients(prev => [...prev.filter(c => !c.id.startsWith('demo-')), newClient]);
      setActiveClient(newClient);
      setAddStep('done');
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : 'Something went wrong');
      setAddStep('form');
    }
  }

  function closeAddModal() {
    setShowAdd(false);
    setAddStep('form');
    setAddForm({ business_name: '', business_phone: '', area_code: '', booking_link: '', job_value: '250' });
    setAddError('');
  }

  const unreadCount = convos.reduce((n, c) => n + c.unread, 0);

  const tabBtn = (id: string, label: string, badge?: number) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={{
        padding: '8px 16px',
        background: 'none',
        border: 'none',
        borderBottom: tab === id ? `2px solid ${T}` : '2px solid transparent',
        color: tab === id ? T : MUTED,
        cursor: 'pointer',
        fontWeight: tab === id ? 600 : 400,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {badge ? (
        <span style={{ background: T, color: '#000', borderRadius: 10, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>{badge}</span>
      ) : null}
    </button>
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: MUTED, fontSize: 14 }}>Loading Respondfall…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, color: FG, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: 220, minHeight: '100vh', background: CARD, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9 2 6 4 5 7L3 15l3-1 1 3 5-3 5 3 1-3 3 1-2-8c-1-3-4-5-7-5z" fill={T} />
              <circle cx="9" cy="10" r="1.5" fill={BG} />
              <circle cx="15" cy="10" r="1.5" fill={BG} />
            </svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: FG }}>RESPONDFALL</div>
              <div style={{ fontSize: 9, color: MUTED, letterSpacing: 0.5 }}>BY SKYFORGEAI</div>
            </div>
          </div>
        </div>

        {/* Client list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <div style={{ padding: '0 16px 8px', fontSize: 10, fontWeight: 600, letterSpacing: 1, color: MUTED, textTransform: 'uppercase' }}>Client Accounts</div>
          {clients.map(client => {
            const isActive = activeClient?.id === client.id;
            return (
              <button
                key={client.id}
                onClick={() => setActiveClient(client)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  background: isActive ? `${T}18` : 'none',
                  border: 'none',
                  borderLeft: isActive ? `2px solid ${T}` : '2px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: isActive ? T : BORDER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isActive ? '#000' : FG, flexShrink: 0 }}>
                  {initials(client.business_name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: FG, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client.business_name}</div>
                  <div style={{ fontSize: 10, color: client.system_active ? GREEN : MUTED }}>
                    {client.system_active ? '● Active' : '○ Paused'}
                  </div>
                </div>
              </button>
            );
          })}
          <div style={{ padding: '8px 16px' }}>
            <button
              onClick={() => setShowAdd(true)}
              style={{ width: '100%', padding: '7px', background: 'none', border: `1px dashed ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Client
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>Agency Owner</div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', padding: '7px', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 12, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeClient && (
          <>
            {/* Client header */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{activeClient.business_name}</h1>
                <div style={{ fontSize: 12, color: T, marginTop: 2 }}>{activeClient.twilio_number ?? 'No number provisioned'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ padding: '4px 12px', background: `${GREEN}22`, border: `1px solid ${GREEN}44`, borderRadius: 20, fontSize: 12, fontWeight: 600, color: GREEN }}>
                  {activeClient.system_active ? '● SYSTEM ACTIVE' : '○ PAUSED'}
                </span>
                <button
                  onClick={handleMarkJobComplete}
                  style={{ padding: '6px 14px', background: jobDone ? GREEN : ORANGE, border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {jobDone ? '✓ Scheduled!' : 'Mark Job Complete'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, padding: '16px 24px', flexWrap: 'wrap' }}>
              {[
                { label: 'MISSED TODAY', value: stats.missedToday, color: FG },
                { label: 'SMS SENT TODAY', value: stats.smsSentToday, color: T },
                { label: 'MISSED 30 DAYS', value: stats.missed30Days, color: FG },
                { label: 'REVENUE PROTECTED', value: `$${stats.revenueProtected.toLocaleString()}`, color: ORANGE },
              ].map(s => (
                <div key={s.label} style={{ flex: '1 1 160px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: MUTED, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, padding: '0 24px', overflowX: 'auto' }}>
              {tabBtn('activity', 'Activity')}
              {tabBtn('inbox', 'Inbox', unreadCount || undefined)}
              {tabBtn('sequences', 'Sequences')}
              {tabBtn('analytics', 'Analytics')}
              {tabBtn('settings', 'Settings')}
              {tabBtn('connect', 'Connect')}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

              {/* Activity */}
              {tab === 'activity' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activity.length === 0 && <div style={{ color: MUTED, fontSize: 13 }}>No activity yet.</div>}
                  {activity.map(ev => (
                    <div key={ev.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 18, flexShrink: 0 }}>
                        {ev.type === 'missed_call' ? '📞' : ev.direction === 'inbound' ? '💬' : '📤'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                          {ev.type === 'missed_call' ? `Missed call from ${ev.caller_phone}` : (ev.direction === 'inbound' ? `Reply from ${ev.caller_phone}` : 'SMS sent')}
                        </div>
                        {ev.body && <div style={{ fontSize: 12, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.body}</div>}
                      </div>
                      <div style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>{timeAgo(ev.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inbox */}
              {tab === 'inbox' && (
                <div style={{ display: 'flex', gap: 16, height: 500 }}>
                  <div style={{ width: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {convos.map(c => (
                      <button
                        key={c.phone}
                        onClick={() => setActiveConvo(c)}
                        style={{ padding: '10px 12px', background: activeConvo?.phone === c.phone ? `${T}18` : CARD, border: `1px solid ${activeConvo?.phone === c.phone ? T : BORDER}`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: FG }}>{c.phone}</span>
                          {c.unread > 0 && <span style={{ background: T, color: '#000', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{c.unread}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{timeAgo(c.lastTs)}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {activeConvo ? (
                      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeConvo.messages.map(m => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: m.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '70%', padding: '8px 12px', borderRadius: 10, background: m.direction === 'outbound' ? T : BORDER, color: m.direction === 'outbound' ? '#000' : FG, fontSize: 13 }}>
                              {m.body}
                              <div style={{ fontSize: 10, color: m.direction === 'outbound' ? '#00000088' : MUTED, marginTop: 4, textAlign: 'right' }}>{timeAgo(m.created_at)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ padding: 16, color: MUTED, fontSize: 13 }}>Select a conversation</div>}
                  </div>
                </div>
              )}

              {/* Sequences */}
              {tab === 'sequences' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { name: 'Booking Recovery', trigger: 'Missed call → immediate', steps: ['SMS 1: immediate — catch caller, offer booking link', 'SMS 2: +15 min — follow-up if no reply', 'SMS 3: +2 hrs — final gentle nudge'], color: T },
                    { name: 'Review Request', trigger: 'Job complete → +2 hours', steps: ['SMS: Google review request with direct link'], color: GREEN },
                    { name: 'Referral Ask', trigger: 'Job complete → +30 minutes', steps: ['SMS: Ask satisfied customer for referral'], color: ORANGE },
                  ].map(seq => (
                    <div key={seq.name} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: FG }}>{seq.name}</div>
                        <span style={{ background: `${seq.color}22`, color: seq.color, border: `1px solid ${seq.color}44`, borderRadius: 12, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>ACTIVE</span>
                      </div>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>{seq.trigger}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {seq.steps.map((step, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: seq.color, color: '#000', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                            <div style={{ fontSize: 12, color: MUTED }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics */}
              {tab === 'analytics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Response Rate', value: '94%', sub: 'calls recovered with SMS', color: GREEN },
                      { label: 'Avg Reply Time', value: '< 30s', sub: 'AI responds instantly', color: T },
                      { label: 'Booking Conversion', value: '38%', sub: 'of SMS threads → booked', color: ORANGE },
                      { label: 'Review Rate', value: '61%', sub: 'left Google review after ask', color: T },
                    ].map(m => (
                      <div key={m.label} style={{ flex: '1 1 160px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: MUTED, textTransform: 'uppercase', marginBottom: 6 }}>{m.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px', color: MUTED, fontSize: 13, textAlign: 'center' }}>
                    Detailed analytics charts coming soon.
                  </div>
                </div>
              )}

              {/* Settings */}
              {tab === 'settings' && (
                <div style={{ maxWidth: 520 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { key: 'booking_link', label: 'Booking Link', placeholder: 'https://calendly.com/...' },
                      { key: 'google_review_link', label: 'Google Review Link', placeholder: 'https://g.page/...' },
                      { key: 'job_value', label: 'Average Job Value ($)', placeholder: '250' },
                      { key: 'blackout_start', label: 'Blackout Start (hour, 0–23)', placeholder: '22' },
                      { key: 'blackout_end', label: 'Blackout End (hour, 0–23)', placeholder: '7' },
                    ].map(field => (
                      <div key={field.key}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 6, letterSpacing: 0.5 }}>{field.label}</label>
                        <input
                          type="text"
                          value={(settingsForm as Record<string, string | boolean>)[field.key] as string}
                          onChange={e => setSettingsForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          style={{ width: '100%', padding: '9px 12px', background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, color: FG, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={settingsForm.system_active}
                        onChange={e => setSettingsForm(prev => ({ ...prev, system_active: e.target.checked }))}
                        id="sys-active"
                        style={{ width: 16, height: 16, accentColor: T, cursor: 'pointer' }}
                      />
                      <label htmlFor="sys-active" style={{ fontSize: 13, color: FG, cursor: 'pointer' }}>System Active (SMS automation enabled)</label>
                    </div>
                    <button
                      onClick={handleSaveSettings}
                      disabled={activeClient.id.startsWith('demo-')}
                      style={{ padding: '10px 24px', background: T, border: 'none', borderRadius: 6, color: '#000', fontWeight: 700, fontSize: 13, cursor: activeClient.id.startsWith('demo-') ? 'not-allowed' : 'pointer', opacity: activeClient.id.startsWith('demo-') ? 0.5 : 1, alignSelf: 'flex-start' }}
                    >
                      {settingsSaved ? '✓ Saved!' : 'Save Settings'}
                    </button>
                    {activeClient.id.startsWith('demo-') && <div style={{ fontSize: 11, color: MUTED }}>Connect a real client to save settings.</div>}
                  </div>
                </div>
              )}

              {/* Connect */}
              {tab === 'connect' && (
                <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '20px' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Twilio Connection</div>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Your Respondfall number routes missed calls through Twilio. Each client gets a dedicated local number.</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ padding: '4px 10px', background: `${GREEN}22`, border: `1px solid ${GREEN}44`, borderRadius: 4, fontSize: 11, color: GREEN, fontWeight: 600 }}>CONNECTED</div>
                    </div>
                  </div>
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '20px' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>n8n Automation</div>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Missed call events are forwarded to n8n for additional automation workflows.</div>
                    <div style={{ fontSize: 12, color: MUTED }}>Webhook URL: <code style={{ background: BG, padding: '2px 6px', borderRadius: 4 }}>{process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? 'Configure N8N_WEBHOOK_URL'}</code></div>
                  </div>
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '20px' }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Stripe Billing</div>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Subscription management via Stripe. Webhooks handle plan changes automatically.</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ padding: '4px 10px', background: `${T}22`, border: `1px solid ${T}44`, borderRadius: 4, fontSize: 11, color: T, fontWeight: 600 }}>CONFIGURE IN ENV</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>

      {/* Add Client Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={e => { if (e.target === e.currentTarget) closeAddModal(); }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '28px 32px', width: 420, maxWidth: '90vw' }}>
            {addStep === 'form' && (
              <>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Add New Client</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>A local Twilio number will be provisioned automatically.</div>
                {addError && <div style={{ padding: '8px 12px', background: '#ff000022', border: '1px solid #ff000044', borderRadius: 6, color: '#ff6b6b', fontSize: 12, marginBottom: 16 }}>{addError}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'business_name', label: 'Business Name *', placeholder: 'Premier Plumbing Co.' },
                    { key: 'business_phone', label: 'Business Phone', placeholder: '+15551234567' },
                    { key: 'area_code', label: 'Area Code for Respondfall Number *', placeholder: '512' },
                    { key: 'booking_link', label: 'Booking Link', placeholder: 'https://calendly.com/...' },
                    { key: 'job_value', label: 'Average Job Value ($)', placeholder: '250' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 4 }}>{f.label}</label>
                      <input
                        type="text"
                        value={(addForm as Record<string, string>)[f.key]}
                        onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{ width: '100%', padding: '8px 10px', background: BG, border: `1px solid ${BORDER}`, borderRadius: 6, color: FG, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={closeAddModal} style={{ flex: 1, padding: '9px', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 6, color: MUTED, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleAddClient} style={{ flex: 2, padding: '9px', background: T, border: 'none', borderRadius: 6, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Provision & Create</button>
                </div>
              </>
            )}
            {addStep === 'provisioning' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Provisioning Number…</div>
                <div style={{ fontSize: 12, color: MUTED }}>Searching Twilio for a local number and setting up webhooks.</div>
              </div>
            )}
            {addStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Client Added!</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>Respondfall number provisioned and client account created.</div>
                <button onClick={closeAddModal} style={{ padding: '9px 24px', background: T, border: 'none', borderRadius: 6, color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
