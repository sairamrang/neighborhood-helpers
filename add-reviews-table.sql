-- Add reviews table for residents to rate and give feedback to providers

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one review per booking
  UNIQUE(booking_id)
);

-- Add index for efficient provider rating lookups
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_resident_id ON reviews(resident_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Everyone can read reviews (public display)
CREATE POLICY "Reviews are publicly readable"
  ON reviews
  FOR SELECT
  USING (true);

-- Residents can create reviews for their own completed bookings
CREATE POLICY "Residents can create reviews for their bookings"
  ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = resident_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.resident_id = resident_id
      AND bookings.status = 'completed'
    )
  );

-- Residents can update their own reviews
CREATE POLICY "Residents can update their own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid() = resident_id)
  WITH CHECK (auth.uid() = resident_id);

-- Residents can delete their own reviews
CREATE POLICY "Residents can delete their own reviews"
  ON reviews
  FOR DELETE
  USING (auth.uid() = resident_id);

-- Create a view to get provider average ratings
CREATE OR REPLACE VIEW provider_ratings AS
SELECT
  provider_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as average_rating
FROM reviews
GROUP BY provider_id;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
