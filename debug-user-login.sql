-- ============================================
-- DEBUG USER LOGIN ISSUE
-- Check user: srangachar.i@gmail.com
-- ============================================

-- STEP 1: Check if user exists in auth.users
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'srangachar.i@gmail.com';

-- STEP 2: Check if profile exists
SELECT
  id,
  email,
  full_name,
  user_type,
  created_at
FROM profiles
WHERE email = 'srangachar.i@gmail.com';

-- STEP 3: If auth user exists but no profile, create it
-- Replace 'USER_ID_FROM_STEP_1' with the actual ID from step 1

/*
INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
VALUES (
  'USER_ID_FROM_STEP_1',  -- Replace with UUID from step 1
  'srangachar.i@gmail.com',
  'Resident User',  -- You can change this
  'resident',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  user_type = EXCLUDED.user_type;
*/

-- STEP 4: Check if email is confirmed
-- If email_confirmed_at is NULL in step 1, run this:

/*
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'srangachar.i@gmail.com';
*/

-- ============================================
-- COMMON ISSUES & FIXES
-- ============================================

-- Issue 1: Email not confirmed
-- Fix: Run the UPDATE query in step 4

-- Issue 2: No profile exists
-- Fix: Uncomment and run the INSERT query in step 3

-- Issue 3: Wrong password
-- Fix: Reset password in Supabase Dashboard → Authentication → Users

-- Issue 4: User doesn't exist at all
-- Fix: Create user in Supabase Dashboard → Authentication → Add User
