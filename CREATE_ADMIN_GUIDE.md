# Create Admin User: admin@gail.com

## Quick Steps

### Step 1: Create User in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Open your project
   - Navigate to **Authentication** → **Users**

2. **Create New User**
   - Click **"Add User"** button
   - Select **"Create new user"**
   - Fill in:
     - **Email**: `admin@gail.com`
     - **Password**: `admin1`
     - **Auto Confirm User**: ✅ **CHECK THIS BOX** (important!)
   - Click **"Create User"**

### Step 2: Set User as Admin (SQL)

1. **Go to SQL Editor** in Supabase
2. **Copy and paste this SQL**:

```sql
-- Create/Update profile with admin role
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
```

3. **Click "Run"**

### Step 3: Verify Admin Created

Run this to check:

```sql
SELECT 
  p.id,
  p.email,
  p.role,
  p.created_at
FROM profiles p
WHERE p.email = 'admin@gail.com';
```

You should see `role = 'admin'`

## Login Credentials

- **Email**: `admin@gail.com`
- **Password**: `admin1`

## Test Login

1. Go to your app
2. Click "Login"
3. Enter:
   - Email: `admin@gail.com`
   - Password: `admin1`
4. You should see "Admin" link in navbar

## Troubleshooting

### User not found?
- Make sure you created the user in Dashboard first
- Check the email spelling: `admin@gail.com`

### Can't login?
- Make sure "Auto Confirm User" was checked when creating
- Try resetting password in Dashboard → Authentication → Users

### Not seeing Admin link?
- Make sure you ran the SQL to set role = 'admin'
- Log out and log back in
- Check the SQL query result to verify role is 'admin'

## Alternative: Create via API (Advanced)

If you want to create the user entirely via code, you'd need to use Supabase Admin API with service role key. The Dashboard method above is easier and recommended.

