-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================
-- Run this SQL in Supabase SQL Editor to fix the infinite recursion error
-- ============================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function to check admin role
-- This avoids infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate the admin policy using the function (but actually, let's simplify)
-- For now, let's just allow users to view their own profile
-- Admins can view all profiles through a different approach

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- ============================================
-- ALTERNATIVE: If the function approach doesn't work,
-- we can temporarily disable RLS for profiles SELECT
-- (NOT RECOMMENDED FOR PRODUCTION, but works for development)
-- ============================================

-- Uncomment below if function approach doesn't work:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- TEST THE FIX
-- ============================================
-- After running this, try logging in again
-- The infinite recursion error should be gone
-- ============================================

