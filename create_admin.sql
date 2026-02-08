-- ============================================
-- Create Admin User: admin@gail.com
-- ============================================
-- Note: You need to create the user in Supabase Dashboard first,
-- then run this SQL to set them as admin
-- ============================================

-- Option 1: If user already exists in auth.users
-- This will create/update the profile with admin role
INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'admin' as role
FROM auth.users
WHERE email = 'admin@gail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = 'admin@gail.com';

-- ============================================
-- Option 2: Create user via Supabase Dashboard first
-- ============================================
-- Steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Email: admin@gail.com
-- 4. Password: admin1
-- 5. Auto Confirm User: YES (check this box)
-- 6. Click "Create User"
-- 7. Then run the SQL above (Option 1)
-- ============================================

-- ============================================
-- Verify the admin was created
-- ============================================
SELECT 
  p.id,
  p.email,
  p.role,
  p.created_at,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email = 'admin@gail.com';

-- ============================================
-- If you need to reset the password later:
-- ============================================
-- Go to Supabase Dashboard → Authentication → Users
-- Find admin@gail.com → Click "..." → "Reset Password"
-- ============================================

