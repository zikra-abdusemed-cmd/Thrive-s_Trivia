# Debug Admin Access Issue

## Quick Check SQL

Run this in Supabase SQL Editor to verify your admin user:

```sql
-- Check if admin user exists and has correct role
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';
```

**Expected Result:**
- `email`: admin@gmail.com
- `email_confirmed_at`: Should have a timestamp (not NULL)
- `role`: Should be `'admin'` (not `'user'` or NULL)

## If Role is NOT 'admin'

Run this to fix it:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');
```

## If Profile Doesn't Exist

Run this to create it:

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

## Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try logging in as admin
4. Look for these messages:
   - `Admin page - User ID: [uuid]`
   - `Admin page - Profile data: {role: 'admin'}`
   - `Admin page - Role: admin`
   - `✅ Admin access granted` or `❌ Not admin...`

## Common Issues

1. **Profile doesn't exist** → Run the SQL above to create it
2. **Role is 'user' instead of 'admin'** → Run the UPDATE SQL above
3. **Email not confirmed** → Confirm user in Supabase Dashboard
4. **Profile query timing out** → The code now retries 3 times with delays

## Test Steps

1. Log in with admin credentials
2. Check browser console for debug messages
3. Check Supabase database for correct role
4. If still not working, share the console output

