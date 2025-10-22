-- ============================================
-- DELETE ALL USERS EXCEPT ADMIN
-- WARNING: This will delete all user data!
-- ============================================

-- STEP 1: Delete all data from tables (except admin profile)
-- ============================================

-- Delete reviews
DELETE FROM reviews;

-- Delete bookings
DELETE FROM bookings;

-- Delete services
DELETE FROM services;

-- Delete service providers
DELETE FROM service_providers;

-- Delete profiles (except admin)
DELETE FROM profiles
WHERE email != 'admin@localassist.com';

-- ============================================
-- STEP 2: Delete auth users (except admin)
-- ============================================

-- NOTE: You need to delete auth users manually from the Supabase Dashboard
-- because SQL access to auth.users requires special permissions
--
-- Go to: Supabase Dashboard → Authentication → Users
-- Delete all users EXCEPT admin@localassist.com
--
-- OR if you have service_role access, you can run:
-- DELETE FROM auth.users WHERE email != 'admin@localassist.com';

-- ============================================
-- STEP 3: Verify only admin remains
-- ============================================

-- Check profiles (should only show admin)
SELECT
  id,
  email,
  full_name,
  user_type,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check all tables are empty
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'service_providers', COUNT(*) FROM service_providers
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;

-- ============================================
-- RESULT
-- ============================================
-- After running this script:
-- - All service data deleted
-- - All bookings deleted
-- - All reviews deleted
-- - All profiles deleted (except admin@localassist.com)
-- - Auth users must be deleted manually from dashboard
