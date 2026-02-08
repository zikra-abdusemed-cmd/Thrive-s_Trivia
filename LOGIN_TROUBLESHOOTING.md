# Login Troubleshooting Guide

## "Invalid login credentials" Error - Common Causes & Fixes

### ✅ Fix 1: Check User Exists and is Confirmed

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **Find your user** (admin@gmail.com)
3. **Check these things:**
   - ✅ User exists in the list
   - ✅ **Email Confirmed** column shows a timestamp (not empty)
   - ✅ **Confirmed** status is checked

**If user is NOT confirmed:**
- Click on the user
- Click **"..."** menu → **"Confirm User"**
- Or check **"Auto Confirm User"** when creating new users

### ✅ Fix 2: Reset Password

Sometimes passwords get corrupted or there's a mismatch:

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user (admin@gmail.com)
3. Click **"..."** menu → **"Reset Password"**
4. Check your email for reset link
5. Or manually set a new password in Dashboard

### ✅ Fix 3: Verify User Exists in Database

Run this SQL in Supabase SQL Editor:

```sql
-- Check if user exists in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@gmail.com';
```

**If no results:**
- User doesn't exist - create it in Dashboard first

**If email_confirmed_at is NULL:**
- User is not confirmed - confirm it in Dashboard

### ✅ Fix 4: Check Profile Exists

Run this SQL:

```sql
-- Check if profile exists
SELECT 
  p.id,
  p.email,
  p.role,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email = 'admin@gmail.com';
```

**If no results:**
- Profile doesn't exist - run the SQL setup again

### ✅ Fix 5: Recreate Admin User (Fresh Start)

If nothing works, delete and recreate:

1. **Delete user:**
   - Supabase Dashboard → Authentication → Users
   - Find admin@gmail.com
   - Click **"..."** → **"Delete User"**

2. **Create new user:**
   - Click **"Add User"** → **"Create new user"**
   - Email: `admin@gmail.com`
   - Password: `admin00`
   - ✅ **CHECK "Auto Confirm User"**
   - Click **"Create User"**

3. **Set admin role:**
   ```sql
   INSERT INTO profiles (id, email, role)
   SELECT 
     id,
     email,
     'admin' as role
   FROM auth.users
   WHERE email = 'admin@gmail.com'
   ON CONFLICT (id) 
   DO UPDATE SET 
     role = 'admin',
     email = 'admin@gmail.com';
   ```

### ✅ Fix 6: Check Email/Password Spelling

Common mistakes:
- Email: `admin@gmail.com` (not `admin@gail.com`)
- Password: `admin00` (not `admin0` or `Admin00`)
- Check for extra spaces
- Check case sensitivity (email should be lowercase)

### ✅ Fix 7: Disable Email Confirmation (For Development)

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **"Email Auth"**
3. **Turn OFF "Enable email confirmations"**
4. Save

This allows login without email confirmation.

### ✅ Fix 8: Check Browser Console

Open browser DevTools (F12) → Console tab
Look for any errors when logging in

Common errors:
- `Invalid login credentials` = Wrong email/password or user not confirmed
- `Email not confirmed` = User needs confirmation
- `User not found` = User doesn't exist

## Quick Diagnostic SQL

Run this to check everything:

```sql
-- Complete user check
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as user_created,
  p.role,
  p.created_at as profile_created,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED'
    ELSE '✅ CONFIRMED'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';
```

**What to look for:**
- ✅ `email_confirmed_at` should have a timestamp
- ✅ `role` should be `admin`
- ✅ Both should exist

## Still Not Working?

1. **Check Supabase project is correct**
   - Make sure you're using the right project
   - Check `.env.local` has correct credentials

2. **Try logging in via Supabase Dashboard**
   - Go to Authentication → Users
   - Click on your user
   - Try the "Send Magic Link" option

3. **Check network tab**
   - Open DevTools → Network tab
   - Try logging in
   - Check if the request is successful
   - Look at the response for error details

4. **Verify environment variables**
   - Check `.env.local` file
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

## Most Common Solution

**90% of the time, the issue is:**
1. User is not confirmed → Confirm in Dashboard
2. Wrong password → Reset password in Dashboard
3. User doesn't exist → Create user in Dashboard with "Auto Confirm" checked

Try Fix 1 first - it solves most issues! 🎯

