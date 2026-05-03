# Respondfall — Claude Code Project Memory

## What This Project Is
Respondfall is a multi-tenant SaaS platform that captures missed calls for local service businesses and converts them into revenue through automated SMS sequences, AI lead qualification, review automation, and referral tracking.

**Tagline**: Missed Call Revenue Recovery  
**Branding**: Powered by SkyforgeAI  
**Target Customer**: Local service businesses (plumbers, HVAC, electricians, roofers)  
**Pricing**: Starter $97/mo | Pro $197/mo | Agency $397/mo

---

## The Stack
- **Framework**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (Postgres + Auth + Edge Functions)
- **Telephony**: Twilio (SMS + call webhooks)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Payments**: Stripe
- **Deployment**: Railway
- **Automation**: n8n webhooks

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
N8N_TWILIO_PROVISION_WEBHOOK
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

---

## Architecture

### Multi-Tenancy Model
- **Agency Owner** = top-level account (Calvin / SkyforgeAI)
- **Clients** = local businesses under the agency (Miami Plumbing Co., South Beach HVAC, etc.)
- Each client has their own Twilio number, SMS sequences, inbox, and analytics
- Agency owner sees all clients in sidebar, can switch between them

### Auth Model
- Supabase Auth for all authentication
- NO plaintext passwords anywhere — ever
- Agency owners and clients are separate user roles
- RLS policies enforce data isolation between clients

### The Three Core Automation Flows

#### 1. Booking Flow
- **Trigger**: Twilio missed call webhook fires
- **Step 1** (5s delay): Recovery SMS with booking link
- **Step 2** (2hr delay, no reply): Follow-up SMS
- **Step 3** (24hr delay, no reply): Final SMS
- **Inbound reply**: Claude AI classifies intent → routes to booking or owner inbox

#### 2. Review Flow
- **Trigger**: Business owner taps "Mark Job Complete" in Inbox
- **Step 1** (2hr delay): Google review request SMS

#### 3. Referral Flow
- **Trigger**: Same "Mark Job Complete" action
- **Step 1** (30min delay): Referral ask SMS
- **Step 2** (after name received): Unique REF code issued
- **Pipeline**: SMS Sent → Name Captured → Code Issued → Converted

---

## Database Tables
- `customers` — client business accounts
- `missed_calls` — every missed call event
- `sms_messages` — all inbound and outbound SMS
- `conversations` — AI conversation threads per caller
- `referrals` — referral tracking with unique codes
- `scheduled_messages` — delayed send queue
- `analytics_events` — event log for all trackable actions
- `audit_log` — system audit trail

---

## API Route Conventions
- Twilio webhooks: `/api/webhooks/twilio/[event]` — always validate Twilio signature
- Internal API: `/api/[resource]/[action]`
- All routes use TypeScript, proper error handling, and return consistent JSON shapes
- Service role key used in edge functions, never exposed to client

---

## UI Design System

### Color Palette
- Background base: `#0d1117`
- Card background: `#161b22`
- Border: `#30363d`
- Primary accent: `#00b4d8` (teal/cyan)
- Revenue/money: `#f97316` (orange-500) — the $14,100 number
- Success/active: `#22c55e` (green-500)
- Missed/error: `#ef4444` (red-500)
- Sent/info: `#3b82f6` (blue-500)
- Text primary: `#f0f6fc`
- Text secondary: `#8b949e`
- Text muted: `#484f58`

### Layout
```
Sidebar (fixed 220px) | Main Content (flex-1)
```

### Sidebar Structure
- Respondfall logo + "by SkyforgeAI" subtitle
- CLIENT ACCOUNTS section header
- Client list (avatar initial, business name, phone number)
- "+ Add Client" button
- Agency Owner badge + plan label at bottom
- Logout button

### Main Content Structure
- Client header: business name, Respondfall number, SYSTEM ACTIVE badge
- Stats row: Missed Today | SMS Sent Today | Missed 30 Days | Revenue Protected
- Tab bar: Activity | Inbox (unread badge) | Sequences | Analytics | Settings | Connect
- Tab content

### Key UI Patterns
- Revenue Protected: large orange number, always emotionally prominent
- SYSTEM ACTIVE: green pill badge
- MISSED call events: red "MISSED" badge on right
- SENT SMS events: green "SENT" badge on right
- AI responses: right-aligned teal chat bubbles
- Customer messages: left-aligned dark chat bubbles
- Sequence steps: numbered cards with trigger description and message preview
- "Complete → Review" button: star icon, gold color

### Tabs Reference
**Activity**: Live feed of missed calls and SMS events  
**Inbox**: Conversation threads with customers, AI handling indicator, Mark Complete button  
**Sequences**: Visual pipeline cards for all three flows (Booking / Review / Referral) + performance stats  
**Analytics**: Revenue protected hero, 7-day/30-day stats, weekly report preview, TCPA compliance status, system health  
**Settings**: Business profile, phone numbers, Twilio number search, SMS config (template, delay, blackout hours), booking link, Google review link, danger zone  
**Connect**: Respondfall number display, conditional call forwarding setup for iPhone/Android/Landline/RingCentral/OpenPhone with carrier-specific codes

---

## Code Conventions
- All components in `app/` use `'use client'` only when needed
- Shared UI components in `components/ui/`
- Database queries in `lib/supabase/`
- Twilio helpers in `lib/twilio/`
- Claude AI helpers in `lib/claude/`
- Types in `types/`
- Always handle loading and error states
- Never expose service keys to the client
- Always validate Twilio webhook signatures before processing

---

## Security Rules — Non-Negotiable
1. No plaintext passwords — Supabase Auth only
2. Twilio signature validation on every webhook
3. RLS enabled on every table — service role for edge functions, user policies for frontend
4. No secret keys in client-side code or `NEXT_PUBLIC_` variables
5. Rate limit all auth endpoints
6. TCPA compliance — honor STOP replies immediately, log all opt-outs

---

## SMS Rules
- Respect blackout hours (default: 10pm–7am, configurable per client)
- Always include STOP option on first message in any sequence
- Honor opt-outs within 5 minutes
- Never send more than 3 steps in a booking sequence without a reply
- Validate phone numbers before sending

---

## The Standard
Every decision should be evaluated against this question:
**"Would a local plumber pay $197/month for this without hesitation?"**

If the answer is no — fix it.

---

## Full Autonomy
Claude Code has full autonomy on this project. If you find something broken, insecure, ugly, incomplete, or suboptimal — fix it without asking. Scan every file. Find every gap. The goal is a 10/10 production-grade SaaS that ships on Railway and works the first time a real customer signs up.

---

*Respondfall — Missed Call Revenue Recovery. Built on Railway. Powered by SkyforgeAI.*
