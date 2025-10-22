# Database Reset Script

This script will **completely wipe your database** and create a single admin user for LocalAssist.

## ⚠️ WARNING

**This script DELETES ALL DATA!** Use with caution. This is intended for development/testing only.

## What Gets Deleted

- All reviews
- All bookings
- All services
- All service providers
- All admin users
- All user profiles

## What Gets Created

A single admin user with these credentials:

- **Username**: `admin`
- **Email**: `admin@localassist.com`
- **Password**: `admin7880`
- **Full Name**: LocalAssist Admin
- **Role**: super_admin

## How to Use

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file `reset-database.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Review the verification output to confirm:
   - All tables show 0 count (except admin_users which should show 1)
   - The admin user details are displayed

## After Running

You can now log in to your admin dashboard at:
- URL: `http://localhost:5173/admin`
- Username: `admin` (or use email: `admin@localassist.com`)
- Password: `admin7880`

## Changing the Admin Password

To use a different password:
1. Open `reset-database.sql`
2. Find line 52: `crypt('admin7880', gen_salt('bf', 10))`
3. Replace `admin7880` with your desired password
4. Save and run the script

The password will be automatically hashed using bcrypt with 10 rounds.

## Security Notes

- The script uses PostgreSQL's `pgcrypto` extension for secure password hashing
- Passwords are hashed at runtime and never stored in plain text
- The bcrypt algorithm with 10 rounds is industry-standard for password security
- After running, you can safely commit this script to version control (the password is only visible in the SQL, not in the database)

## Troubleshooting

If you get an error about `pgcrypto`:
```sql
ERROR: extension "pgcrypto" does not exist
```

Run this first in SQL Editor:
```sql
CREATE EXTENSION pgcrypto;
```

Then run the reset script again.
