# Deploy Thrive Trivia to Vercel - Complete Guide

## Prerequisites

✅ GitHub account (or GitLab/Bitbucket)
✅ Vercel account (free tier works great!)
✅ Supabase project set up
✅ Your code pushed to a Git repository

## Step 1: Prepare Your Code

### 1.1 Ensure Logo is in Public Folder

Make sure your logo is in the `public` folder:
```bash
# If not already done:
cp image/logo.png public/logo.png
```

### 1.2 Create .env.example (Optional but Recommended)

Create a `.env.example` file to document required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:** Never commit `.env.local` to Git! It should be in `.gitignore`.

### 1.3 Verify .gitignore

Make sure your `.gitignore` includes:
```
.env.local
.env*.local
node_modules
.next
```

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)

```bash
cd "/home/penelope/Downloads/Telegram Desktop/mcq-game"
git init
git add .
git commit -m "Initial commit - Thrive Trivia app"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"**
3. Name it: `thrive-trivia` (or any name you like)
4. **Don't** initialize with README (you already have files)
5. Click **"Create repository"**

### 2.3 Push Your Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/thrive-trivia.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Deploy to Vercel

### 3.1 Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Sign up with GitHub (recommended - easier integration)

### 3.2 Import Your Project

1. Once logged in, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find and click **"Import"** next to your `thrive-trivia` repository

### 3.3 Configure Project

Vercel will auto-detect Next.js settings. You just need to:

1. **Project Name:** Keep default or change it
2. **Framework Preset:** Should be "Next.js" (auto-detected)
3. **Root Directory:** Leave as `./` (default)
4. **Build Command:** Leave as `next build` (default)
5. **Output Directory:** Leave as `.next` (default)

### 3.4 Add Environment Variables

**IMPORTANT:** Add these environment variables in Vercel:

1. Click **"Environment Variables"** section
2. Add each variable:

   **Variable 1:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Your Supabase project URL
   - **Environment:** Production, Preview, Development (select all)

   **Variable 2:**
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** Your Supabase anon/public key
   - **Environment:** Production, Preview, Development (select all)

   **Variable 3:**
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Your Supabase service role key (for admin operations)
   - **Environment:** Production, Preview, Development (select all)

3. Click **"Add"** for each variable
4. Click **"Deploy"**

### 3.5 Where to Find Supabase Keys

1. Go to your Supabase Dashboard
2. Click **Settings** (gear icon) → **API**
3. You'll find:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 4: Wait for Deployment

1. Vercel will build your app (takes 1-3 minutes)
2. You'll see build logs in real-time
3. Once complete, you'll get a deployment URL like:
   - `https://thrive-trivia.vercel.app`

## Step 5: Post-Deployment Checklist

### 5.1 Test Your App

1. ✅ Visit your Vercel URL
2. ✅ Test login/signup
3. ✅ Test admin login
4. ✅ Test playing a game
5. ✅ Check leaderboard
6. ✅ Verify logo appears everywhere

### 5.2 Update Supabase Settings (If Needed)

If you have email confirmation enabled:
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**
3. Add to **Redirect URLs**: `https://your-app.vercel.app/**`

### 5.3 Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 6: Continuous Deployment

✅ **Automatic Deployments:**
- Every push to `main` branch = Production deployment
- Every push to other branches = Preview deployment
- Pull requests = Preview deployment with unique URL

## Troubleshooting

### Build Fails

**Error: Module not found**
- Check all import paths are correct
- Make sure all files are committed to Git

**Error: Environment variables missing**
- Double-check all 3 Supabase variables are added in Vercel
- Make sure they're enabled for the right environments

**Error: Image not found**
- Make sure `public/logo.png` exists and is committed to Git

### App Works Locally But Not on Vercel

1. **Check environment variables** - They might be missing
2. **Check build logs** - Look for errors in Vercel dashboard
3. **Check Supabase RLS policies** - Make sure they work with production URL
4. **Check CORS settings** - Supabase should allow your Vercel domain

### Logo Not Showing

1. Make sure `public/logo.png` is committed to Git
2. Check file path is `/logo.png` (not `/image/logo.png`)
3. Clear browser cache

### Database Connection Issues

1. Verify Supabase URL and keys are correct
2. Check Supabase project is active (not paused)
3. Verify RLS policies allow public access where needed

## Quick Reference

### Vercel Dashboard
- **URL:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Deployments:** See all deployments and their status
- **Settings:** Configure environment variables, domains, etc.
- **Logs:** View build and runtime logs

### Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Useful Commands

```bash
# Check if everything is committed
git status

# Push updates to trigger new deployment
git add .
git commit -m "Update app"
git push

# View Vercel CLI (if installed)
vercel --version
```

## Next Steps After Deployment

1. ✅ Share your Vercel URL with users
2. ✅ Set up custom domain (optional)
3. ✅ Monitor deployments in Vercel dashboard
4. ✅ Set up error tracking (optional - Sentry, etc.)
5. ✅ Configure analytics (optional - Vercel Analytics)

## Support

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

Your app should now be live on Vercel! 🎉

