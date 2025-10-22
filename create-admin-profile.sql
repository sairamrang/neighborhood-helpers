-- Create Profile for Admin User
-- This script creates a profile for your admin user

-- Step 1: Find your admin user ID
SELECT id, email FROM auth.users WHERE email = 'admin@localassist.com';

-- Step 2: Create the profile (replace USER_ID with the ID from step 1)
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with the actual UUID from the query above

INSERT INTO profiles (id, email, full_name, user_type, phone, address, created_at, updated_at)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace this with the UUID from step 1
  'admin@localassist.com',
  'LocalAssist Admin',
  'resident',  -- or 'provider' if you want admin to also be a provider
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = 'admin@localassist.com',
  full_name = 'LocalAssist Admin',
  user_type = 'resident';

-- Step 3: Verify the profile was created
SELECT * FROM profiles WHERE email = 'admin@localassist.com';
