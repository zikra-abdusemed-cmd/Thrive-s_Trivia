# Fix Infinite Recursion Error

## The Problem
The RLS policy for profiles is causing infinite recursion because it checks the profiles table to see if a user is admin, which requires checking the profiles table again.

## Quick Fix - Run This SQL in Supabase

```sql
-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function to check admin role
-- This bypasses RLS and avoids infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate the admin policy using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );
```

## Alternative Quick Fix (For Development Only)

If the function approach doesn't work, you can temporarily disable RLS for profiles SELECT:

```sql
-- WARNING: This disables security for profiles table
-- Only use for development/testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

## After Running the Fix

1. Try logging in again
2. The infinite recursion error should be gone
3. Admin login should work properly

## Why This Happens

The original policy was:
```sql
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles  -- This queries profiles
      WHERE id = auth.uid() AND role = 'admin'  -- Which needs to check profiles again
    )
  );
```

This creates a loop: to check if you can read profiles, it needs to read profiles to check your role.

The fix uses a `SECURITY DEFINER` function that bypasses RLS, breaking the recursion.

