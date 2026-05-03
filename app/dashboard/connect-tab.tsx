'use client';

const T = '#00b4d8';
const BG = '#0d1117';
const CARD = '#161b22';
const BORDER = '#30363d';
const MUTED = '#8b949e';
const FG = '#e6edf3';
const GREEN = '#22c55e';

const CARRIERS = [
  {
    name: 'AT&T',
    code: (num: string) => `*004*+1${num.replace(/\D/g, '').slice(-10)}#`,
    cancel: '#004#',
    note: 'Dial from your business phone to activate conditional forwarding.',
  },
  {
    name: 'Verizon',
    code: (num: string) => `*71${num.replace(/\D/g, '').slice(-10)}`,
    cancel: '*73',
    note: 'Activates busy + no-answer forwarding.',
  },
  {
    name: 'T-Mobile',
    code: (num: string) => `**61*+1${num.replace(/\D/g, '').slice(-10)}#`,
    cancel: '##61#',
    note: 'No-answer forwarding only. Dial from the business line.',
  },
  {
    name: 'Landline / VoIP',
    code: (num: string) => `*92${num.replace(/\D/g, '').slice(-10)}`,
    cancel: '*93',
    note: 'Most landline carriers. Confirm with your provider.',
  },
  {
    name: 'RingCentral',
    code: () => 'Settings → Phone → Call Handling → Missed Calls → Forward to number',
    cancel: 'Same path — remove the forwarding number',
    note: 'Use the RingCentral admin portal or desktop app.',
  },
  {
    name: 'OpenPhone',
    code: () => 'Settings → Your number → Call forwarding → When unavailable',
    cancel: 'Toggle off in same menu',
    note: 'Set under each individual number in OpenPhone settings.',
  },
];

export function ConnectTab({ twilioNumber }: { twilioNumber: string | null }) {
  const num = twilioNumber ?? '';
  const digits = num.replace(/\D/g, '').slice(-10);

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Respondfall number */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '20px' }}>
        <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>Your Respondfall Number</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T, letterSpacing: 1, marginBottom: 8 }}>
          {twilioNumber ?? 'Not provisioned — add a client first'}
        </div>
        {twilioNumber && (
          <>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>
              Forward missed calls from your business line to this number. Respondfall will catch every missed call and send an automated SMS sequence.
            </div>
            <button
              onClick={() => copy(twilioNumber)}
              style={{ padding: '6px 14px', background: `${T}22`, border: `1px solid ${T}44`, borderRadius: 6, color: T, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Copy Number
            </button>
          </>
        )}
      </div>

      {/* Carrier instructions */}
      {twilioNumber && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '20px' }}>
          <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>Conditional Call Forwarding Setup</div>
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>Choose your carrier and dial the code shown to forward unanswered calls to Respondfall.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CARRIERS.map(carrier => {
              const activateCode = carrier.code(digits);
              const cancelCode = carrier.cancel;
              return (
                <div key={carrier.name} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: FG }}>{carrier.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: MUTED, width: 52, flexShrink: 0 }}>Activate:</span>
                      <code style={{ flex: 1, background: CARD, padding: '4px 8px', borderRadius: 4, fontSize: 12, color: T, border: `1px solid ${BORDER}` }}>{activateCode}</code>
                      <button onClick={() => copy(activateCode)} style={{ padding: '4px 8px', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 4, color: MUTED, fontSize: 10, cursor: 'pointer', flexShrink: 0 }}>Copy</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: MUTED, width: 52, flexShrink: 0 }}>Cancel:</span>
                      <code style={{ flex: 1, background: CARD, padding: '4px 8px', borderRadius: 4, fontSize: 12, color: MUTED, border: `1px solid ${BORDER}` }}>{cancelCode}</code>
                      <button onClick={() => copy(cancelCode)} style={{ padding: '4px 8px', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 4, color: MUTED, fontSize: 10, cursor: 'pointer', flexShrink: 0 }}>Copy</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>{carrier.note}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Twilio + n8n status */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Twilio', status: 'Connected', color: GREEN },
          { label: 'n8n Automation', status: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? 'Connected' : 'Configure env', color: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ? GREEN : MUTED },
          { label: 'Stripe Billing', status: 'Configure env', color: MUTED },
        ].map(item => (
          <div key={item.label} style={{ flex: '1 1 140px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: FG, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
