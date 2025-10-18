import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: 'fan' | 'creator' | 'admin';
  bio: string;
  language: 'en' | 'fr';
  currency: 'EUR' | 'USD';
  is_age_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type CreatorSettings = {
  id: string;
  user_id: string;
  message_price_eur: number;
  message_price_usd: number;
  entry_fee_eur: number;
  entry_fee_usd: number;
  payout_email: string | null;
  total_earnings_eur: number;
  total_earnings_usd: number;
  pending_payout_eur: number;
  pending_payout_usd: number;
  created_at: string;
  updated_at: string;
};

export type FanWallet = {
  id: string;
  user_id: string;
  credits_eur: number;
  credits_usd: number;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  fan_id: string;
  creator_id: string;
  entry_paid: boolean;
  entry_amount: number;
  entry_currency: 'EUR' | 'USD';
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_type: 'text' | 'photo' | 'video' | 'voice';
  media_url: string | null;
  is_locked: boolean;
  unlock_price_eur: number;
  unlock_price_usd: number;
  is_read: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: 'credit_purchase' | 'message_payment' | 'entry_fee' | 'media_unlock' | 'payout';
  amount: number;
  currency: 'EUR' | 'USD';
  platform_fee: number;
  creator_id: string | null;
  conversation_id: string | null;
  message_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  payment_method: 'stripe' | 'paypal' | 'credits' | null;
  external_id: string | null;
  created_at: string;
};
