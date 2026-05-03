export interface Customer {
  id: string;
  business_name: string;
  business_phone: string;
  twilio_number: string;
  owner_email: string;
  tier: 'starter' | 'pro' | 'agency';
  booking_link?: string;
  google_review_link?: string;
  sms_template: string;
  sms_blackout_start: string;
  sms_blackout_end: string;
  system_active: boolean;
  created_at: string;
}

export interface MissedCall {
  id: string;
  customer_id: string;
  caller_phone: string;
  twilio_number: string;
  called_at: string;
  sequence_started: boolean;
}

export interface SMSMessage {
  id: string;
  customer_id: string;
  from_phone: string;
  to_phone: string;
  body: string;
  direction: 'inbound' | 'outbound';
  ai_generated: boolean;
  opted_out: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  caller_phone: string;
  status: 'active' | 'booked' | 'complete' | 'opted_out';
  created_at: string;
}

export interface Referral {
  id: string;
  customer_id: string;
  referrer_phone: string;
  referrer_name?: string;
  ref_code: string;
  status: 'sms_sent' | 'name_captured' | 'code_issued' | 'converted';
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  customer_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
