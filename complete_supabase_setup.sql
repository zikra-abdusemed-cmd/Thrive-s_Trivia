-- ============================================
-- THRIVE TRIVIA - COMPLETE SUPABASE SETUP
-- ============================================
-- This SQL creates all necessary tables, policies, and functions
-- for the Thrive Trivia MCQ game application
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores user profile information including role (user/admin)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Anyone can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create a security definer function to check admin role (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy: Admins can view all profiles (using security definer function)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
-- Stores question categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read categories
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Policy: Only admins can insert categories
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update categories
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS categories_name_idx ON categories(name);

-- ============================================
-- 3. QUESTIONS TABLE
-- ============================================
-- Stores MCQ questions with options and correct answer
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct TEXT NOT NULL CHECK (correct IN ('a', 'b', 'c', 'd')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read questions
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

-- Policy: Only admins can insert questions
CREATE POLICY "Admins can insert questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update questions
CREATE POLICY "Admins can update questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete questions
CREATE POLICY "Admins can delete questions"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS questions_category_id_idx ON questions(category_id);
CREATE INDEX IF NOT EXISTS questions_created_at_idx ON questions(created_at);

-- ============================================
-- 4. SCORES TABLE
-- ============================================
-- Stores user game scores
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own scores
CREATE POLICY "Users can view own scores"
  ON scores FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own scores
CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Everyone can view all scores (for leaderboard)
CREATE POLICY "Anyone can view all scores"
  ON scores FOR SELECT
  USING (true);

-- Policy: Only admins can delete scores
CREATE POLICY "Admins can delete scores"
  ON scores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for faster lookups and sorting
CREATE INDEX IF NOT EXISTS scores_user_id_idx ON scores(user_id);
CREATE INDEX IF NOT EXISTS scores_score_idx ON scores(score DESC);
CREATE INDEX IF NOT EXISTS scores_created_at_idx ON scores(created_at DESC);

-- ============================================
-- 5. FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- ============================================
-- Automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. FUNCTION TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================
-- Ensure authenticated users have necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON questions TO authenticated;
GRANT ALL ON scores TO authenticated;

-- ============================================
-- 8. CREATE ADMIN USER
-- ============================================
-- IMPORTANT: You cannot create users with passwords directly in SQL
-- You MUST create the user in Supabase Dashboard first, then run the SQL below
-- 
-- Steps to create admin user:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Email: admin@gmail.com
-- 4. Password: admin00
-- 5. ✅ CHECK "Auto Confirm User"
-- 6. Click "Create User"
-- 7. Then run the SQL below to set admin role
-- ============================================

-- Set admin role for admin@gmail.com (run this AFTER creating user in Dashboard)
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

-- ============================================
-- 9. VERIFY ADMIN USER WAS CREATED
-- ============================================
-- Run this to check if admin was created successfully
SELECT 
  p.id,
  p.email,
  p.role,
  p.created_at,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email = 'admin@gmail.com';

-- Should show: role = 'admin'
-- ============================================

-- ============================================
-- 10. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================
-- Uncomment below to insert sample categories and questions

/*
-- Insert sample categories
INSERT INTO categories (name) VALUES 
  ('General Knowledge'),
  ('Science'),
  ('History'),
  ('Technology'),
  ('Programming'),
  ('Mathematics')
ON CONFLICT (name) DO NOTHING;

-- Insert sample questions
-- Note: Replace category_id with actual UUID from categories table
INSERT INTO questions (category_id, question, option_a, option_b, option_c, option_d, correct) VALUES
  (
    (SELECT id FROM categories WHERE name = 'Programming' LIMIT 1),
    'What does HTML stand for?',
    'HyperText Markup Language',
    'High-Level Text Markup Language',
    'Hyperlink and Text Markup Language',
    'Home Tool Markup Language',
    'a'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Programming' LIMIT 1),
    'Which of the following is a JavaScript framework?',
    'React',
    'Python',
    'Java',
    'C++',
    'a'
  ),
  (
    (SELECT id FROM categories WHERE name = 'General Knowledge' LIMIT 1),
    'What is the capital of France?',
    'Paris',
    'London',
    'Berlin',
    'Madrid',
    'a'
  ),
  (
    (SELECT id FROM categories WHERE name = 'Science' LIMIT 1),
    'What is the chemical symbol for water?',
    'H2O',
    'CO2',
    'O2',
    'NaCl',
    'a'
  )
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- 
-- NEXT STEPS:
-- 1. Create admin user in Supabase Dashboard:
--    - Go to Authentication → Users
--    - Add User → Create new user
--    - Email: admin@gmail.com
--    - Password: admin00
--    - ✅ Auto Confirm User
--    - Create User
--
-- 2. The SQL above (section 8) will automatically set the admin role
--    when you run this file AFTER creating the user
--
-- 3. Login credentials:
--    Email: admin@gmail.com
--    Password: admin00
--
-- 4. Test by logging into your app - you should see "Admin" in navbar
--
-- ============================================
-- DATABASE STRUCTURE:
-- ============================================
-- ✅ profiles - User profiles with roles
-- ✅ categories - Question categories
-- ✅ questions - MCQ questions
-- ✅ scores - User game scores
-- ✅ RLS policies - Security enabled
-- ✅ Triggers - Auto profile creation, updated_at
-- ✅ Indexes - Performance optimized
-- ============================================

