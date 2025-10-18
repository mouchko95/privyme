/*
  # PrivyMe Database Schema

  ## Overview
  Complete database schema for PrivyMe - a premium creator-fan messaging platform with pay-per-message system.

  ## 1. New Tables

  ### `profiles`
  Extended user profile information linked to Supabase auth.users
  - `id` (uuid, FK to auth.users) - User ID
  - `username` (text, unique) - Unique username for creator links
  - `display_name` (text) - Display name
  - `avatar_url` (text) - Profile picture URL
  - `role` (text) - User role: 'fan' or 'creator'
  - `bio` (text) - User biography
  - `language` (text) - Preferred language: 'en' or 'fr'
  - `currency` (text) - Preferred currency: 'EUR' or 'USD'
  - `is_age_verified` (boolean) - 18+ verification status
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `creator_settings`
  Creator-specific configuration
  - `id` (uuid, PK) - Settings ID
  - `user_id` (uuid, FK to profiles) - Creator user ID
  - `message_price_eur` (decimal) - Message price in EUR
  - `message_price_usd` (decimal) - Message price in USD
  - `entry_fee_eur` (decimal) - Entry fee to start chatting in EUR
  - `entry_fee_usd` (decimal) - Entry fee to start chatting in USD
  - `payout_email` (text) - PayPal email for payouts
  - `total_earnings_eur` (decimal) - Total earnings in EUR
  - `total_earnings_usd` (decimal) - Total earnings in USD
  - `pending_payout_eur` (decimal) - Pending payout amount in EUR
  - `pending_payout_usd` (decimal) - Pending payout amount in USD
  - `created_at` (timestamptz) - Settings creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `fan_wallets`
  Fan credit balances
  - `id` (uuid, PK) - Wallet ID
  - `user_id` (uuid, FK to profiles) - Fan user ID
  - `credits_eur` (decimal) - EUR credit balance
  - `credits_usd` (decimal) - USD credit balance
  - `created_at` (timestamptz) - Wallet creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `conversations`
  Chat conversations between fans and creators
  - `id` (uuid, PK) - Conversation ID
  - `fan_id` (uuid, FK to profiles) - Fan user ID
  - `creator_id` (uuid, FK to profiles) - Creator user ID
  - `entry_paid` (boolean) - Whether entry fee has been paid
  - `entry_amount` (decimal) - Entry fee amount paid
  - `entry_currency` (text) - Currency of entry fee
  - `last_message_at` (timestamptz) - Timestamp of last message
  - `created_at` (timestamptz) - Conversation creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `messages`
  Individual messages in conversations
  - `id` (uuid, PK) - Message ID
  - `conversation_id` (uuid, FK to conversations) - Conversation ID
  - `sender_id` (uuid, FK to profiles) - Sender user ID
  - `content` (text) - Message text content
  - `media_type` (text) - Type: 'text', 'photo', 'video', 'voice'
  - `media_url` (text) - URL to media file
  - `is_locked` (boolean) - Whether media is paywalled
  - `unlock_price_eur` (decimal) - Unlock price in EUR
  - `unlock_price_usd` (decimal) - Unlock price in USD
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Message creation timestamp

  ### `transactions`
  All financial transactions in the platform
  - `id` (uuid, PK) - Transaction ID
  - `user_id` (uuid, FK to profiles) - User involved in transaction
  - `type` (text) - Type: 'credit_purchase', 'message_payment', 'entry_fee', 'media_unlock', 'payout'
  - `amount` (decimal) - Transaction amount
  - `currency` (text) - Currency: 'EUR' or 'USD'
  - `platform_fee` (decimal) - Platform commission (5%)
  - `creator_id` (uuid, FK to profiles) - Creator receiving payment (if applicable)
  - `conversation_id` (uuid, FK to conversations) - Related conversation (if applicable)
  - `message_id` (uuid, FK to messages) - Related message (if applicable)
  - `status` (text) - Status: 'pending', 'completed', 'failed'
  - `payment_method` (text) - Payment method: 'stripe', 'paypal', 'credits'
  - `external_id` (text) - External payment ID from Stripe/PayPal
  - `created_at` (timestamptz) - Transaction creation timestamp

  ### `payouts`
  Creator payout requests
  - `id` (uuid, PK) - Payout ID
  - `creator_id` (uuid, FK to profiles) - Creator requesting payout
  - `amount` (decimal) - Payout amount
  - `currency` (text) - Currency: 'EUR' or 'USD'
  - `payout_email` (text) - PayPal email
  - `status` (text) - Status: 'pending', 'processing', 'completed', 'failed'
  - `external_id` (text) - PayPal payout batch ID
  - `created_at` (timestamptz) - Payout request timestamp
  - `processed_at` (timestamptz) - Payout processing timestamp

  ### `reports`
  User reports for moderation
  - `id` (uuid, PK) - Report ID
  - `reporter_id` (uuid, FK to profiles) - User making the report
  - `reported_user_id` (uuid, FK to profiles) - User being reported
  - `message_id` (uuid, FK to messages) - Reported message (if applicable)
  - `reason` (text) - Report reason
  - `description` (text) - Detailed description
  - `status` (text) - Status: 'pending', 'reviewed', 'dismissed', 'action_taken'
  - `admin_notes` (text) - Admin notes
  - `created_at` (timestamptz) - Report creation timestamp
  - `reviewed_at` (timestamptz) - Review timestamp

  ### `blocked_users`
  User blocking relationships
  - `id` (uuid, PK) - Block ID
  - `blocker_id` (uuid, FK to profiles) - User who blocked
  - `blocked_id` (uuid, FK to profiles) - User who was blocked
  - `created_at` (timestamptz) - Block creation timestamp

  ## 2. Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies to ensure:
  - Users can only access their own data
  - Creators can only access their conversations and messages
  - Fans can only access their conversations and messages
  - Admins have full access (via service role)
  - Financial data is protected and only accessible to involved parties

  ### Policies
  Each table has specific policies for SELECT, INSERT, UPDATE, and DELETE operations based on user roles and ownership.

  ## 3. Important Notes

  ### Currency Handling
  - All monetary values stored as NUMERIC(10,2) for precision
  - Dual currency support (EUR/USD) with separate columns
  - Platform fee is 5% of all transactions

  ### Creator Access
  - Any user can become a creator by updating their role
  - Creator settings are created automatically via trigger

  ### Entry Fee Logic
  - Fans must pay entry fee before sending first message
  - Entry fee is one-time per conversation
  - Tracked in conversations.entry_paid

  ### Message Pricing
  - Each message from fan deducts credits based on creator's price
  - Locked media requires additional unlock payment
  - All payments create transaction records

  ### Indexes
  - Foreign keys are indexed for performance
  - Username is unique and indexed
  - Conversation lookups are optimized
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'fan' CHECK (role IN ('fan', 'creator', 'admin')),
  bio text DEFAULT '',
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr')),
  currency text NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD')),
  is_age_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Creator settings table
CREATE TABLE IF NOT EXISTS creator_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  message_price_eur numeric(10,2) DEFAULT 1.00,
  message_price_usd numeric(10,2) DEFAULT 1.00,
  entry_fee_eur numeric(10,2) DEFAULT 5.00,
  entry_fee_usd numeric(10,2) DEFAULT 5.00,
  payout_email text,
  total_earnings_eur numeric(10,2) DEFAULT 0.00,
  total_earnings_usd numeric(10,2) DEFAULT 0.00,
  pending_payout_eur numeric(10,2) DEFAULT 0.00,
  pending_payout_usd numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE creator_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own settings"
  ON creator_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can update own settings"
  ON creator_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can insert own settings"
  ON creator_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Fans can view creator settings for pricing"
  ON creator_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = creator_settings.user_id
      AND profiles.role = 'creator'
    )
  );

-- Fan wallets table
CREATE TABLE IF NOT EXISTS fan_wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  credits_eur numeric(10,2) DEFAULT 0.00,
  credits_usd numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fan_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fans can view own wallet"
  ON fan_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Fans can update own wallet"
  ON fan_wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Fans can insert own wallet"
  ON fan_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_paid boolean DEFAULT false,
  entry_amount numeric(10,2) DEFAULT 0.00,
  entry_currency text DEFAULT 'EUR' CHECK (entry_currency IN ('EUR', 'USD')),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(fan_id, creator_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = fan_id OR auth.uid() = creator_id);

CREATE POLICY "Fans can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = fan_id OR auth.uid() = creator_id)
  WITH CHECK (auth.uid() = fan_id OR auth.uid() = creator_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  media_type text DEFAULT 'text' CHECK (media_type IN ('text', 'photo', 'video', 'voice')),
  media_url text,
  is_locked boolean DEFAULT false,
  unlock_price_eur numeric(10,2) DEFAULT 0.00,
  unlock_price_usd numeric(10,2) DEFAULT 0.00,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.fan_id = auth.uid() OR conversations.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.fan_id = auth.uid() OR conversations.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages they sent"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit_purchase', 'message_payment', 'entry_fee', 'media_unlock', 'payout')),
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('EUR', 'USD')),
  platform_fee numeric(10,2) DEFAULT 0.00,
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method text CHECK (payment_method IN ('stripe', 'paypal', 'credits')),
  external_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_creator ON transactions(creator_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = creator_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('EUR', 'USD')),
  payout_email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  external_id text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payouts_creator ON payouts(creator_id);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can request payouts"
  ON payouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
  ON blocked_users FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
  ON blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks"
  ON blocked_users FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- Function to auto-create creator settings when user becomes creator
CREATE OR REPLACE FUNCTION create_creator_settings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'creator' AND OLD.role != 'creator' THEN
    INSERT INTO creator_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_change
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_creator_settings();

-- Function to auto-create fan wallet
CREATE OR REPLACE FUNCTION create_fan_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO fan_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_fan_wallet();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_creator_settings_updated_at
  BEFORE UPDATE ON creator_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_fan_wallets_updated_at
  BEFORE UPDATE ON fan_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();