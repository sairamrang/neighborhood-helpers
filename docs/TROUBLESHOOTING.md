# Troubleshooting Guide

## Issue: "Could not find the table 'public.profiles'" Error

This means the database schema hasn't been applied to your Supabase database yet.

### Solution: Apply the Database Schema

#### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to your Supabase project:**
   - URL: https://supabase.com/dashboard/project/ugkykgxawxyasgidljmr
   - Or go to https://supabase.com and log in, then select your project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click the "+ New Query" button at the top

3. **Copy the schema:**
   - Open `supabase-schema.sql` file in this project
   - Select ALL the text (Cmd+A or Ctrl+A)
   - Copy it (Cmd+C or Ctrl+C)

4. **Paste and run:**
   - Paste the entire schema into the Supabase SQL Editor
   - Click the green "Run" button (or press Cmd+Enter)
   - Wait for it to complete

5. **Verify success:**
   - You should see "Success. No rows returned" at the bottom
   - This is correct - it means tables were created!

6. **Check tables were created:**
   - Click "Table Editor" in the left sidebar
   - You should see these tables:
     - profiles
     - service_providers
     - services
     - bookings

#### Method 2: Via Supabase CLI

If you prefer using the CLI:

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref ugkykgxawxyasgidljmr
   ```

4. Push the schema:
   ```bash
   supabase db push
   ```

### After Applying Schema

Once the schema is applied, test the connection:

```bash
node test-connection.js
```

You should see:
```
✅ Successfully connected to Supabase!
✅ Database schema is applied correctly.
```

Then restart your dev servers and try again!

---

## Other Common Issues

### Issue: Frontend won't start

**Error:** `npm run dev` fails

**Solutions:**
1. Make sure you're in the right directory:
   ```bash
   cd /Users/sai.rangachari/Ideas/neighborhood-helpers
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Check Node version (needs 18+):
   ```bash
   node --version
   ```

### Issue: Backend won't start

**Error:** Backend server fails to start

**Solutions:**
1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Check `.env` file exists:
   ```bash
   ls -la .env
   ```

4. Copy from example if missing:
   ```bash
   cp .env.example .env
   ```

5. Edit `backend/.env` and add your Supabase credentials

### Issue: "Missing Supabase environment variables"

**Error:** Frontend or backend complains about missing env vars

**Solutions:**

**For Frontend:**
1. Check `.env` file exists in root:
   ```bash
   cat .env
   ```

2. Should contain:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```

3. Restart dev server after changing `.env`

**For Backend:**
1. Check `backend/.env` file exists:
   ```bash
   cat backend/.env
   ```

2. Should contain:
   ```env
   PORT=3001
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_ANON_KEY=your_anon_key
   ADMIN_EMAILS=your_email@example.com
   ```

### Issue: Can't sign up / "Failed to create account"

**Possible causes:**
1. Database schema not applied (see above)
2. Supabase auth not enabled
3. Email confirmation required

**Solutions:**

1. **Disable email confirmation (for development):**
   - Go to Supabase Dashboard
   - Click "Authentication" in left menu
   - Click "Providers"
   - Find "Email" provider
   - Scroll down to "Confirm email"
   - Toggle it OFF for development
   - Click "Save"

2. **Check auth is enabled:**
   - Go to Authentication > Providers
   - Make sure "Email" is enabled

### Issue: Services not showing up

**Possible causes:**
1. Service provider not approved yet
2. Service marked as inactive
3. No services created

**Solutions:**
1. **Approve the provider:**
   - Login with the email listed in `ADMIN_EMAILS`
   - Go to `/admin` in browser
   - Approve the pending provider

2. **Check service is active:**
   - Login as provider
   - Go to "My Profile"
   - Make sure service is created and active

### Issue: "Admin access required"

**Cause:** Your email is not in the admin list

**Solution:**
1. Edit `backend/.env`
2. Add your email to `ADMIN_EMAILS`:
   ```env
   ADMIN_EMAILS=youremail@example.com,another@example.com
   ```
3. Restart backend server
4. Login with that email

### Issue: Port already in use

**Error:** "EADDRINUSE: address already in use :::5173" or :::3001

**Solutions:**

**For Frontend (port 5173):**
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9
```

**For Backend (port 3001):**
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

Then restart the servers.

### Issue: CORS errors in browser console

**Error:** "Access to fetch at ... has been blocked by CORS policy"

**Cause:** Frontend and backend are not configured to talk to each other

**Solution:**
The backend is already configured to accept requests from `localhost:5173`. Make sure:
1. Backend is running on port 3001
2. Frontend is running on port 5173
3. Both servers are running simultaneously

### Issue: White screen / blank page

**Possible causes:**
1. JavaScript error (check browser console)
2. Build issue
3. Missing dependencies

**Solutions:**
1. **Check browser console** (F12 or Cmd+Option+I)
   - Look for red errors
   - Share the error message for help

2. **Rebuild:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. **Clear browser cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## Still Having Issues?

If none of these solutions work:

1. **Check the browser console** (F12) for errors
2. **Check terminal output** for error messages
3. **Verify all environment variables** are set correctly
4. **Try the test connection script:**
   ```bash
   node test-connection.js
   ```

### Getting Help

When asking for help, please provide:
1. The exact error message (from browser console or terminal)
2. Which step you're on
3. Your Node.js version: `node --version`
4. Whether the database schema has been applied
5. Output from `node test-connection.js`
