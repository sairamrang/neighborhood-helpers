-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('resident', 'provider')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service providers table
CREATE TABLE service_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'hourly')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  resident_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'confirmed', 'declined', 'completed', 'cancelled')),
  booking_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
  resident_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Create indexes for better performance
CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX idx_service_providers_approved ON service_providers(is_approved);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_resident_id ON bookings(resident_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_resident_id ON reviews(resident_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service providers policies
CREATE POLICY "Approved service providers are viewable by everyone"
  ON service_providers FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own service provider profile"
  ON service_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service provider profile"
  ON service_providers FOR UPDATE
  USING (auth.uid() = user_id);

-- Services policies
CREATE POLICY "Active services from approved providers are viewable by everyone"
  ON services FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = services.provider_id
      AND service_providers.is_approved = true
    )
    OR EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = services.provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Service providers can create their own services"
  ON services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Service providers can update their own services"
  ON services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = services.provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Service providers can delete their own services"
  ON services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = services.provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = resident_id
    OR EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = bookings.provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = resident_id);

CREATE POLICY "Providers and residents can update their bookings"
  ON bookings FOR UPDATE
  USING (
    auth.uid() = resident_id
    OR EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = bookings.provider_id
      AND service_providers.user_id = auth.uid()
    )
  );

-- Function to automatically create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'resident')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reviews policies
CREATE POLICY "Reviews are publicly readable"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Residents can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = resident_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.resident_id = resident_id
      AND bookings.status = 'completed'
    )
  );

CREATE POLICY "Residents can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = resident_id)
  WITH CHECK (auth.uid() = resident_id);

CREATE POLICY "Residents can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = resident_id);

-- Create a view to get provider average ratings
CREATE OR REPLACE VIEW provider_ratings AS
SELECT
  provider_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as average_rating
FROM reviews
GROUP BY provider_id;
