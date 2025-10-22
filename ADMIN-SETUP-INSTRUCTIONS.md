# Admin Setup Instructions

Since the current app uses **Supabase Auth** for login (not the `admin_users` table), you need to create an admin user in Supabase Authentication.

## Quick Setup (2 Steps)

### Step 1: Create Admin User in Supabase Auth

1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Fill in the details:
   - **Email**: `admin@localassist.com`
   - **Password**: `admin7880`
   - **Auto Confirm User**: ✅ (check this box)
5. Click **Create User**

### Step 2: Mark User as Admin in Database

Run this SQL in the **SQL Editor**:

```sql
-- Find the user ID for admin@localassist.com
SELECT id, email FROM auth.users WHERE email = 'admin@localassist.com';

-- Copy the ID from above and use it below
-- Replace 'USER_ID_HERE' with the actual UUID
INSERT INTO profiles (id, email, full_name, user_type, created_at)
VALUES (
  'USER_ID_HERE',  -- Replace with the UUID from the query above
  'admin@localassist.com',
  'LocalAssist Admin',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = 'admin@localassist.com',
  full_name = 'LocalAssist Admin',
  user_type = 'admin';
```

## Done!

You can now log in at:
- URL: `http://localhost:5173/login`
- Email: `admin@localassist.com`
- Password: `admin7880`

After logging in, navigate to `http://localhost:5173/admin` to access the admin dashboard.

---

## Alternative: Automated Setup Script

If you want to automate this, run the SQL script below to create everything at once:

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Create the auth user
-- Note: This requires auth.admin role or service_role key
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@localassist.com',
  crypt('admin7880', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
RETURNING id;

-- Step 2: Get the user ID and create profile
-- Replace USER_ID_FROM_ABOVE with the ID from the previous query
WITH new_user AS (
  SELECT id FROM auth.users WHERE email = 'admin@localassist.com'
)
INSERT INTO profiles (id, email, full_name, user_type, created_at)
SELECT
  id,
  'admin@localassist.com',
  'LocalAssist Admin',
  'admin',
  NOW()
FROM new_user
ON CONFLICT (id) DO UPDATE SET
  email = 'admin@localassist.com',
  full_name = 'LocalAssist Admin',
  user_type = 'admin';
```

**Note**: The automated script may not work depending on your Supabase security settings. If it fails, use the manual method (Step 1 & 2) above.

---

## Troubleshooting

### "User already exists"
If you get this error, the user already exists. Just run Step 2 to ensure the profile is set up correctly.

### "Invalid login credentials"
Make sure you:
1. Checked "Auto Confirm User" when creating the user
2. Used the exact email: `admin@localassist.com`
3. Used the exact password: `admin7880`

### Can't access /admin page
The admin page currently doesn't have access control. Any logged-in user can access it. If you want proper admin access control, we'll need to implement role-based authentication.
