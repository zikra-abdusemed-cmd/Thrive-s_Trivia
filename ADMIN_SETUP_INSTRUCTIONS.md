# Complete Setup Instructions for Admin User

## ⚠️ IMPORTANT: You Cannot Create Users with Passwords in SQL

Supabase requires you to create users through the Dashboard or API. The SQL file will automatically set the admin role once the user exists.

## Step-by-Step Setup

### Step 1: Create Admin User in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Open your project
   - Navigate to **Authentication** → **Users**

2. **Create New User**
   - Click **"Add User"** button (top right)
   - Select **"Create new user"**
   - Fill in the form:
     - **Email**: `admin@gmail.com`
     - **Password**: `admin00`
     - ✅ **CHECK "Auto Confirm User"** (very important!)
   - Click **"Create User"**

### Step 2: Run the Complete SQL File

1. **Go to SQL Editor** in Supabase
2. **Open** `complete_supabase_setup.sql`
3. **Copy the entire file** and paste into SQL Editor
4. **Click "Run"** or press `Ctrl+Enter`

This will:
- ✅ Create all tables (profiles, categories, questions, scores)
- ✅ Set up Row Level Security policies
- ✅ Create triggers for auto profile creation
- ✅ Set admin@gmail.com as admin role automatically

### Step 3: Verify Admin User

Run this SQL to check:

```sql
SELECT email, role FROM profiles WHERE email = 'admin@gmail.com';
```

Should show: `role = 'admin'`

### Step 4: Test Login

1. Go to your app
2. Click "Login"
3. Enter:
   - **Email**: `admin@gmail.com`
   - **Password**: `admin00`
4. You should see **"Admin"** link in the navbar

## Login Credentials

- **Email**: `admin@gmail.com`
- **Password**: `admin00`

## What the SQL Creates

### Tables:
1. **profiles** - User profiles with roles (user/admin)
2. **categories** - Question categories
3. **questions** - MCQ questions with 4 options
4. **scores** - User game scores

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only modify their own data
- ✅ Admins have full CRUD access
- ✅ Public read access for leaderboard

### Features:
- ✅ Auto-creates profile when users sign up
- ✅ Auto-updates `updated_at` timestamps
- ✅ Indexes for performance
- ✅ Foreign key constraints

## Troubleshooting

### "User not found" error?
- Make sure you created the user in Dashboard FIRST (Step 1)
- Check email spelling: `admin@gmail.com` (not gail.com)

### Can't login?
- Make sure "Auto Confirm User" was checked when creating user
- Try resetting password: Dashboard → Authentication → Users → Find user → Reset Password

### Not seeing Admin link?
- Verify role is 'admin': Run the verification SQL above
- Log out and log back in
- Check browser console for errors

### SQL errors?
- Make sure you're running the complete file
- Check if tables already exist (you may need to drop them first)
- Ensure you have proper permissions in Supabase

## Quick SQL to Check Everything

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'categories', 'questions', 'scores');

-- Check admin user
SELECT email, role, created_at 
FROM profiles 
WHERE email = 'admin@gmail.com';

-- Check categories
SELECT * FROM categories;

-- Check questions
SELECT COUNT(*) as question_count FROM questions;
```

## Next Steps After Setup

1. ✅ Login as admin
2. ✅ Create some categories in Admin Panel
3. ✅ Add questions to categories
4. ✅ Test playing a game
5. ✅ Check leaderboard

Your app is now ready to use! 🎉

