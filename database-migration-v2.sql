-- ============================================
-- DATABASE MIGRATION V2
-- Hyper-Local Community Marketplace Updates
-- ============================================

-- 1. Add avatar support to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Enhance service_providers table
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending'
  CHECK (approval_status IN ('pending', 'approved', 'rejected', 'inactive'));
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing is_approved to use new approval_status
UPDATE service_providers SET approval_status = 'approved' WHERE is_approved = TRUE;
UPDATE service_providers SET approval_status = 'pending' WHERE is_approved = FALSE;

-- 3. Enhance services table with service-specific data
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Update price_type to support new models
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_price_type_check;
ALTER TABLE services ADD CONSTRAINT services_price_type_check
  CHECK (price_type IN ('fixed', 'hourly', 'daily', 'per_unit', 'custom_quote'));

-- Update category to match new service types
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;
ALTER TABLE services ADD CONSTRAINT services_category_check
  CHECK (category IN ('Window Washing', 'Lawn Care', 'Tech Support', 'Pet Sitting', 'Pet Walking', 'Tutoring'));

-- 4. Enhance bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_details JSONB DEFAULT '{}';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_cost DECIMAL(10, 2);

-- 5. Create admin_users table (separate from regular users)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create service_images table
CREATE TABLE IF NOT EXISTS service_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create booking_attachments table
CREATE TABLE IF NOT EXISTS booking_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'provider', 'resident', 'service', 'booking'
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Add indexes for new tables and columns
CREATE INDEX IF NOT EXISTS idx_service_providers_approval_status ON service_providers(approval_status);
CREATE INDEX IF NOT EXISTS idx_service_providers_is_active ON service_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category_active ON services(category, is_active);
CREATE INDEX IF NOT EXISTS idx_service_images_service_id ON service_images(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_attachments_booking_id ON booking_attachments(booking_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);

-- 10. Enable RLS on new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for service_images (public read, provider write)
CREATE POLICY "Service images are publicly viewable"
  ON service_images FOR SELECT
  USING (true);

CREATE POLICY "Providers can manage their service images"
  ON service_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      JOIN service_providers ON services.provider_id = service_providers.id
      WHERE services.id = service_images.service_id
      AND service_providers.user_id = auth.uid()
    )
  );

-- 12. RLS Policies for booking_attachments
CREATE POLICY "Booking attachments viewable by booking participants"
  ON booking_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_attachments.booking_id
      AND (
        bookings.resident_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM service_providers
          WHERE service_providers.id = bookings.provider_id
          AND service_providers.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Booking participants can upload attachments"
  ON booking_attachments FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_attachments.booking_id
      AND (
        bookings.resident_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM service_providers
          WHERE service_providers.id = bookings.provider_id
          AND service_providers.user_id = auth.uid()
        )
      )
    )
  );

-- 13. RLS Policies for admin_users (admin only)
CREATE POLICY "Only admins can view admin users"
  ON admin_users FOR SELECT
  USING (false); -- Handled by backend only

-- 14. RLS Policies for admin_activity_log (admin only)
CREATE POLICY "Only admins can view activity log"
  ON admin_activity_log FOR SELECT
  USING (false); -- Handled by backend only

-- 15. Update existing RLS policies for services (make public for browsing)
DROP POLICY IF EXISTS "Active services from approved providers are viewable by everyone" ON services;
CREATE POLICY "Services are publicly viewable"
  ON services FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM service_providers
      WHERE service_providers.id = services.provider_id
      AND service_providers.approval_status = 'approved'
      AND service_providers.is_active = true
    )
  );

-- 16. Create view for service listings with provider info and ratings
CREATE OR REPLACE VIEW service_listings AS
SELECT
  s.id,
  s.title,
  s.description,
  s.category,
  s.price,
  s.price_type,
  s.service_details,
  s.pricing_details,
  s.image_urls,
  s.created_at,
  sp.id as provider_id,
  sp.bio as provider_bio,
  sp.profile_image_url as provider_image,
  p.full_name as provider_name,
  p.avatar_url as provider_avatar,
  COALESCE(pr.average_rating, 0) as average_rating,
  COALESCE(pr.review_count, 0) as review_count
FROM services s
JOIN service_providers sp ON s.provider_id = sp.id
JOIN profiles p ON sp.user_id = p.id
LEFT JOIN provider_ratings pr ON sp.id = pr.provider_id
WHERE s.is_active = true
  AND sp.approval_status = 'approved'
  AND sp.is_active = true
  AND p.is_active = true;

-- 17. Create function to update service provider approval
CREATE OR REPLACE FUNCTION approve_service_provider(
  provider_id_param UUID,
  admin_id_param UUID,
  notes_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE service_providers
  SET
    approval_status = 'approved',
    approved_by = admin_id_param,
    approved_at = NOW(),
    admin_notes = notes_param,
    is_approved = TRUE
  WHERE id = provider_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Create function to deactivate user (admin action)
CREATE OR REPLACE FUNCTION deactivate_user(
  user_id_param UUID,
  user_type_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_type_param = 'provider' THEN
    UPDATE service_providers
    SET is_active = FALSE
    WHERE user_id = user_id_param;
  END IF;

  UPDATE profiles
  SET is_active = FALSE
  WHERE id = user_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Add triggers for new tables
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 20. Insert default service categories data (optional)
-- This can be used for validation on the frontend
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO service_categories (name, description, icon, display_order) VALUES
  ('Window Washing', 'Professional window cleaning services', '🪟', 1),
  ('Lawn Care', 'Lawn mowing, trimming, and maintenance', '🌱', 2),
  ('Tech Support', 'Computer, phone, and technology help', '💻', 3),
  ('Pet Sitting', 'In-home pet care while you''re away', '🐕', 4),
  ('Pet Walking', 'Dog walking and exercise services', '🦮', 5),
  ('Tutoring', 'Academic tutoring and homework help', '📚', 6)
ON CONFLICT (name) DO NOTHING;

-- 21. Create indexes on JSONB columns for better performance
CREATE INDEX IF NOT EXISTS idx_services_service_details ON services USING GIN (service_details);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_details ON bookings USING GIN (booking_details);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verification queries (optional - run to verify)
-- SELECT * FROM service_categories;
-- SELECT COUNT(*) FROM admin_users;
-- SELECT approval_status, COUNT(*) FROM service_providers GROUP BY approval_status;
