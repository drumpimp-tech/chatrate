-- ChatRate Database Schema

-- Host settings (single row for Trevor)
CREATE TABLE IF NOT EXISTS host_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  display_name TEXT NOT NULL DEFAULT 'Trevor',
  bio TEXT NOT NULL DEFAULT 'Expert consultant available for calls.',
  service_type TEXT NOT NULL DEFAULT 'Business Consultation',
  rate_type TEXT NOT NULL DEFAULT 'per_minute' CHECK (rate_type IN ('flat', 'per_minute')),
  rate NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
  transcript_fee NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);

-- Insert default host settings row
INSERT INTO host_settings (display_name, bio, service_type, rate_type, rate, transcript_fee, is_available)
VALUES ('Trevor', 'Expert consultant. Book a call to get personalized advice and feedback.', 'Business Consultation', 'per_minute', 1.00, 10.00, true)
ON CONFLICT DO NOTHING;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Client info
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,

  -- Service
  service_type TEXT NOT NULL,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('flat', 'per_minute')),
  rate NUMERIC(10, 2) NOT NULL,

  -- Transcript
  transcript_opted_in BOOLEAN NOT NULL DEFAULT FALSE,
  transcript_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  transcript_text TEXT,

  -- Daily.co
  daily_room_url TEXT,
  daily_room_name TEXT,

  -- Stripe
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  stripe_setup_intent_id TEXT,

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,

  -- Call lifecycle
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  amount_charged NUMERIC(10, 2)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email);

-- RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (API routes use service role)
CREATE POLICY "Service role full access bookings"
  ON bookings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access host_settings"
  ON host_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_settings_updated_at
  BEFORE UPDATE ON host_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
