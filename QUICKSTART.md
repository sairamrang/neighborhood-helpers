# Quick Start Guide

This guide will help you get NeighborHood Helpers up and running in minutes.

## Prerequisites Check

Before starting, make sure you have:
- [ ] Node.js 18 or higher installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] A Supabase account (free tier is fine)

## Step-by-Step Setup

### Step 1: Supabase Database Setup (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Fill in project details:
   - Name: `neighborhood-helpers`
   - Database Password: (save this somewhere safe)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)
5. Once ready, go to "SQL Editor" in the left menu
6. Click "New Query"
7. Copy the entire contents of `supabase-schema.sql` from this project
8. Paste it into the SQL editor and click "Run"
9. You should see "Success. No rows returned" - this is good!

### Step 2: Get Your Supabase Credentials

1. In Supabase, go to "Project Settings" (gear icon in left menu)
2. Click "API" in the sidebar
3. You'll need these values:
   - **Project URL**: Copy the URL under "Project URL"
   - **Anon/Public Key**: Copy the key under "Project API keys" → "anon public"
   - **Service Role Key**: Copy the key under "Project API keys" → "service_role" (keep this secret!)

### Step 3: Frontend Setup (2 minutes)

1. Open terminal in the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Open `.env` and replace the values:
   ```env
   VITE_SUPABASE_URL=your_project_url_from_step2
   VITE_SUPABASE_ANON_KEY=your_anon_key_from_step2
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:5173` - you should see the landing page!

### Step 4: Backend Setup (2 minutes)

1. Open a NEW terminal window
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Open `backend/.env` and replace the values:
   ```env
   PORT=3001
   SUPABASE_URL=your_project_url_from_step2
   SUPABASE_SERVICE_KEY=your_service_role_key_from_step2
   SUPABASE_ANON_KEY=your_anon_key_from_step2
   ADMIN_EMAILS=your_email@example.com
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

7. You should see "Server running on port 3001"

## Test It Out!

Now you have both frontend and backend running. Let's test:

1. Go to `http://localhost:5173` in your browser
2. Click "Sign Up"
3. Create a test resident account:
   - Full Name: Test Resident
   - Email: resident@test.com
   - Password: test123
   - Select "Resident"
4. You should be redirected to the dashboard!

5. Open a new incognito/private window
6. Create a test provider account:
   - Full Name: Test Provider
   - Email: provider@test.com
   - Password: test123
   - Select "Service Provider"
7. Go to "My Profile"
8. Fill in your bio and add a service
9. Go back to the first window (resident account)
10. Click "Services" - you won't see the service yet because it needs admin approval

11. Open another incognito window
12. Sign up with the email you used in `ADMIN_EMAILS`
13. Go to `/admin` in the URL
14. Approve the provider!
15. Now the resident can see and book the service

## Common Issues

### "Missing Supabase environment variables"
- Make sure your `.env` files are created and have the correct values
- Restart the dev servers after creating/updating `.env` files

### "Failed to fetch"
- Make sure the backend server is running on port 3001
- Check that there are no other apps using port 3001

### Can't see services as a resident
- Service providers need to be approved by an admin first
- Make sure you created services as a provider
- Make sure the services are marked as "active"

### Admin dashboard shows "Admin access required"
- Make sure your email is in the `ADMIN_EMAILS` env variable in `backend/.env`
- Restart the backend server after adding your email

## Next Steps

Now that everything is working:

1. **Customize the categories**: Edit the `CATEGORIES` array in the code
2. **Add more test data**: Create multiple providers and services
3. **Test the booking flow**: Create bookings and test accept/decline
4. **Deploy to production**: Follow the deployment guides in the main README

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review the [supabase-schema.sql](supabase-schema.sql) to understand the database
- Look at the code in `src/pages/` to see how each feature works

Happy coding!
