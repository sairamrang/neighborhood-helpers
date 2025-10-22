-- ============================================
-- DATABASE RESET AND ADMIN SETUP SCRIPT
-- LocalAssist - Clean Slate
-- ============================================

-- WARNING: This script will DELETE ALL DATA!
-- Use with caution. This is intended for development/testing only.

-- ============================================
-- STEP 1: Delete All Data
-- ============================================

-- Delete in order to respect foreign key constraints
DELETE FROM reviews;
DELETE FROM bookings;
DELETE FROM services;
DELETE FROM service_providers;
DELETE FROM admin_users;
DELETE FROM profiles;

-- Delete auth users (if you have access to auth schema)
-- Note: This may require admin privileges
-- DELETE FROM auth.users;

-- ============================================
-- STEP 2: Reset Sequences (Optional)
-- ============================================

-- This ensures IDs start from 1 again
-- Only works if tables use sequences

-- ============================================
-- STEP 3: Enable pgcrypto extension
-- ============================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 4: Create Single Admin User
-- ============================================

-- Insert into admin_users table
-- Username: admin
-- Email: admin@localassist.com
-- Password: admin7880 (hashed using bcrypt with 10 rounds)
INSERT INTO admin_users (id, username, email, password_hash, full_name, role, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@localassist.com',
  crypt('admin7880', gen_salt('bf', 10)), -- Generate bcrypt hash dynamically
  'LocalAssist Admin',
  'super_admin',
  TRUE,
  NOW()
);

-- ============================================
-- STEP 5: Verification Queries
-- ============================================

-- Check that all tables are empty
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'service_providers', COUNT(*) FROM service_providers
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;

-- Show admin user details
SELECT
  username,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM admin_users;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

-- To run this script:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run" or press Cmd/Ctrl + Enter
-- 4. Verify the results in the output

-- ADMIN CREDENTIALS:
-- Username: admin
-- Email: admin@localassist.com
-- Password: admin7880
-- Full Name: LocalAssist Admin
-- Role: super_admin

-- To change the admin password:
-- Replace 'admin7880' in line 52 with your desired password
-- The script will automatically hash it using bcrypt

-- ============================================
-- IMPORTANT SECURITY NOTE
-- ============================================

-- This script uses PostgreSQL's pgcrypto extension to hash passwords.
-- The password is hashed at runtime, so it's never stored in plain text.
-- After running this script, you can safely share it (without the password)
-- by changing line 50 to use a placeholder like 'CHANGE_ME'
