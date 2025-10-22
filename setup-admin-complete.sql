-- ============================================
-- COMPLETE ADMIN SETUP SCRIPT
-- Creates admin user in Supabase Auth + Profile
-- ============================================

-- STEP 1: Create the admin user in Supabase Auth
-- Go to: Supabase Dashboard → Authentication → Users → Add User
--
-- Fill in:
--   Email: admin@localassist.com
--   Password: admin7880
--   ✅ Auto Confirm User (IMPORTANT!)
--
-- Click "Create User"
-- Then come back and run the queries below

-- ============================================
-- STEP 2: After creating user, get the user ID
-- ============================================

SELECT id, email, created_at
FROM auth.users
WHERE email = 'admin@localassist.com';

-- Copy the 'id' value from the result above

-- ============================================
-- STEP 3: Create profile for admin
-- ============================================

-- Replace 'PASTE_USER_ID_HERE' with the UUID from step 2
INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
VALUES (
  'PASTE_USER_ID_HERE',  -- ← REPLACE THIS
  'admin@localassist.com',
  'LocalAssist Admin',
  'resident',  -- Admin is a resident who can view everything
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  user_type = EXCLUDED.user_type;

-- ============================================
-- STEP 4: Verify everything is set up
-- ============================================

-- Check profile exists
SELECT
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.created_at
FROM profiles p
WHERE p.email = 'admin@localassist.com';

-- ============================================
-- ADMIN LOGIN CREDENTIALS
-- ============================================
-- Email: admin@localassist.com
-- Password: admin7880
-- Login at: http://localhost:5173/login
