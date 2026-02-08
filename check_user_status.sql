-- ============================================
-- DIAGNOSTIC SQL: Check User Status
-- ============================================
-- Run this to check if your admin user is set up correctly
-- ============================================

-- Check if user exists in auth.users and is confirmed
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ NOT CONFIRMED - This is likely the problem!'
    ELSE '✅ CONFIRMED'
  END as confirmation_status,
  u.created_at as user_created
FROM auth.users u
WHERE u.email = 'admin@gmail.com';

-- Check if profile exists and has admin role
SELECT 
  p.id,
  p.email,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ ADMIN'
    WHEN p.role = 'user' THEN '⚠️ USER (needs to be changed to admin)'
    ELSE '❌ NO ROLE'
  END as role_status,
  p.created_at as profile_created
FROM profiles p
WHERE p.email = 'admin@gmail.com';

-- Complete check - shows everything together
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ USER NOT CONFIRMED'
    WHEN p.role IS NULL THEN '❌ PROFILE MISSING'
    WHEN p.role != 'admin' THEN '⚠️ NOT ADMIN (role: ' || p.role || ')'
    ELSE '✅ ALL GOOD - User should be able to login'
  END as overall_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';

-- ============================================
-- QUICK FIXES (run if needed)
-- ============================================

-- Fix 1: Confirm the user (if not confirmed)
-- Note: You can't do this in SQL, must use Dashboard
-- Go to: Authentication → Users → Find user → Confirm User

-- Fix 2: Create/Update profile with admin role
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

-- Fix 3: Check all users (if email is wrong)
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- WHAT TO DO BASED ON RESULTS:
-- ============================================
-- 
-- If "email_confirmed_at" is NULL:
--   → Go to Supabase Dashboard → Authentication → Users
--   → Find admin@gmail.com → Click "..." → "Confirm User"
--
-- If profile doesn't exist or role is not 'admin':
--   → Run Fix 2 SQL above
--
-- If user doesn't exist at all:
--   → Create user in Dashboard first, then run Fix 2
--
-- ============================================

