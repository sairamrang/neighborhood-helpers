# Deployment Guide

This guide walks you through deploying NeighborHood Helpers to production.

## Overview

- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Railway
- **Database**: Supabase (already cloud-hosted)

## Prerequisites

- [ ] Supabase project set up with schema deployed
- [ ] GitHub repository created (recommended for easy deployment)
- [ ] Vercel account (free tier is fine)
- [ ] Railway account (free tier is fine)

## Step 1: Prepare for Deployment

### 1.1 Push to GitHub (Recommended)

```bash
git init
git add .
git commit -m "Initial commit - NeighborHood Helpers"
git branch -M main
git remote add origin https://github.com/yourusername/neighborhood-helpers.git
git push -u origin main
```

### 1.2 Verify Environment Variables

Make sure you have all the necessary environment variables documented:

**Frontend (.env)**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Backend (.env)**:
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_ANON_KEY`
- `ADMIN_EMAILS`

## Step 2: Deploy Backend to Railway

### Option A: Deploy via GitHub (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect the Node.js project

6. **Configure the service**:
   - Click on the service
   - Go to "Settings"
   - Set "Root Directory" to `backend`
   - Set "Start Command" to `npm run build && npm start`

7. **Add environment variables**:
   - Go to "Variables" tab
   - Add each environment variable:
     ```
     PORT=3001
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_KEY=your_service_role_key
     SUPABASE_ANON_KEY=your_anon_key
     ADMIN_EMAILS=admin@example.com
     ```

8. **Deploy**:
   - Railway will automatically deploy
   - Once deployed, copy the public URL (e.g., `https://your-app.up.railway.app`)

### Option B: Deploy via Railway CLI

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Navigate to backend and initialize:
```bash
cd backend
railway init
```

4. Deploy:
```bash
railway up
```

5. Add environment variables via Railway dashboard

## Step 3: Deploy Frontend to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add environment variables**:
   - Click "Environment Variables"
   - Add:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your deployment URL (e.g., `https://neighborhood-helpers.vercel.app`)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? Choose your account
   - Link to existing project? No
   - Project name? neighborhood-helpers
   - Which directory? ./
   - Auto-detected settings? Yes

4. Add environment variables:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

5. Redeploy:
```bash
vercel --prod
```

## Step 4: Update Backend CORS (Important!)

Once you have your Vercel frontend URL, update the backend to allow CORS from that domain.

1. Go to your Railway backend service
2. Update the environment variables or code to include your frontend URL in CORS settings

If you want to update the code:

**backend/src/index.ts**:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://neighborhood-helpers.vercel.app', // Add your Vercel URL
  ],
  credentials: true
}));
```

Then commit and push to trigger a redeploy.

## Step 5: Test Production Deployment

1. Visit your Vercel URL
2. Create a test account
3. Try all features:
   - Sign up as resident and provider
   - Create services
   - Make bookings
   - Test admin approval (with admin email)

## Step 6: Custom Domain (Optional)

### For Vercel (Frontend)

1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### For Railway (Backend)

1. Go to your service in Railway
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment-Specific Configuration

### Production Best Practices

1. **Security**:
   - Never commit `.env` files
   - Use strong passwords for admin accounts
   - Keep Service Role Key secret
   - Enable Supabase RLS policies (already done via schema)

2. **Performance**:
   - Vercel automatically handles CDN and caching
   - Railway auto-scales based on traffic
   - Consider Supabase connection pooling for high traffic

3. **Monitoring**:
   - Check Railway logs for backend errors
   - Check Vercel deployment logs for frontend issues
   - Monitor Supabase dashboard for database performance

## Troubleshooting

### Frontend can't connect to backend
- Verify CORS is configured correctly
- Check that backend Railway URL is accessible
- Verify environment variables are set correctly

### Authentication not working
- Verify Supabase credentials are correct
- Check Supabase authentication is enabled
- Ensure RLS policies are applied

### Services not showing up
- Verify service providers are approved
- Check database has data
- Verify API routes are working (check Railway logs)

## Continuous Deployment

Both Vercel and Railway support automatic deployments:

1. **GitHub Integration**:
   - Every push to `main` branch triggers automatic deployment
   - Pull requests create preview deployments

2. **Environment Branches**:
   - Create a `staging` branch for testing
   - Create separate Railway/Vercel projects for staging

## Cost Estimates

### Free Tier Limits

**Vercel**:
- 100 GB bandwidth/month
- Unlimited deployments
- Commercial use allowed

**Railway**:
- $5 free credit/month
- Pay for what you use beyond that
- Typically $5-10/month for small apps

**Supabase**:
- 500MB database
- 50,000 monthly active users
- 2GB bandwidth
- Upgrade at ~$25/month for more

## Support

For deployment issues:
- Vercel: Check [vercel.com/docs](https://vercel.com/docs)
- Railway: Check [docs.railway.app](https://docs.railway.app)
- Supabase: Check [supabase.com/docs](https://supabase.com/docs)
