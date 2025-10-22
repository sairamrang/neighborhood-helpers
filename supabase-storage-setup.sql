-- ============================================
-- SUPABASE STORAGE SETUP
-- Image Upload Infrastructure
-- ============================================

-- STEP 1: Create Storage Buckets (via Supabase Dashboard)
-- Go to: Storage → Create new bucket
--
-- Bucket 1: profile-avatars
--   - Name: profile-avatars
--   - Public: YES
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Bucket 2: service-images
--   - Name: service-images
--   - Public: YES
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- Bucket 3: booking-attachments
--   - Name: booking-attachments
--   - Public: NO (private)
--   - File size limit: 5MB
--   - Allowed MIME types: image/jpeg, image/png, image/webp

-- ============================================
-- STEP 2: Storage Policies (Run in SQL Editor)
-- ============================================

-- ------------------------------------------------
-- BUCKET: profile-avatars (PUBLIC)
-- ------------------------------------------------

-- Policy 1: Anyone can view avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

-- Policy 2: Authenticated users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ------------------------------------------------
-- BUCKET: service-images (PUBLIC)
-- ------------------------------------------------

-- Policy 1: Anyone can view service images
CREATE POLICY "Service images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

-- Policy 2: Service providers can upload images for their services
CREATE POLICY "Providers can upload service images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images'
  AND EXISTS (
    SELECT 1 FROM service_providers
    WHERE service_providers.user_id = auth.uid()
    AND service_providers.id::text = (storage.foldername(name))[1]
  )
);

-- Policy 3: Providers can update their service images
CREATE POLICY "Providers can update their service images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'service-images'
  AND EXISTS (
    SELECT 1 FROM service_providers
    WHERE service_providers.user_id = auth.uid()
    AND service_providers.id::text = (storage.foldername(name))[1]
  )
);

-- Policy 4: Providers can delete their service images
CREATE POLICY "Providers can delete their service images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'service-images'
  AND EXISTS (
    SELECT 1 FROM service_providers
    WHERE service_providers.user_id = auth.uid()
    AND service_providers.id::text = (storage.foldername(name))[1]
  )
);

-- ------------------------------------------------
-- BUCKET: booking-attachments (PRIVATE)
-- ------------------------------------------------

-- Policy 1: Booking participants can view attachments
CREATE POLICY "Booking participants can view attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'booking-attachments'
  AND (
    -- Booking folder name is the booking ID
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id::text = (storage.foldername(name))[1]
      AND (
        bookings.resident_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM service_providers
          WHERE service_providers.id = bookings.provider_id
          AND service_providers.user_id = auth.uid()
        )
      )
    )
  )
);

-- Policy 2: Booking participants can upload attachments
CREATE POLICY "Booking participants can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'booking-attachments'
  AND EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id::text = (storage.foldername(name))[1]
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

-- Policy 3: Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'booking-attachments'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- ============================================
-- STEP 3: Helper Functions
-- ============================================

-- Function to get avatar URL
CREATE OR REPLACE FUNCTION get_avatar_url(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT
      CASE
        WHEN avatar_url IS NOT NULL
        THEN avatar_url
        ELSE NULL
      END
    FROM profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update avatar URL in profile
CREATE OR REPLACE FUNCTION update_avatar_url(
  user_id_param UUID,
  new_avatar_url TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET avatar_url = new_avatar_url
  WHERE id = user_id_param;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: File Organization Structure
-- ============================================

-- profile-avatars/
--   {user_id}/
--     avatar.jpg
--
-- service-images/
--   {provider_id}/
--     {service_id}/
--       image-1.jpg
--       image-2.jpg
--       image-3.jpg
--
-- booking-attachments/
--   {booking_id}/
--     {user_id}/
--       photo-1.jpg
--       photo-2.jpg

-- ============================================
-- STEP 5: Validation & Testing Queries
-- ============================================

-- Test: Check if buckets exist
SELECT
  name,
  public,
  created_at
FROM storage.buckets
WHERE name IN ('profile-avatars', 'service-images', 'booking-attachments');

-- Test: Check storage policies
SELECT
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- Test: Count images per bucket
SELECT
  bucket_id,
  COUNT(*) as image_count,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
GROUP BY bucket_id;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- NEXT STEPS:
-- 1. Create buckets in Supabase Dashboard
-- 2. Run this SQL file in SQL Editor
-- 3. Test upload with frontend components
-- 4. Verify policies are working correctly
