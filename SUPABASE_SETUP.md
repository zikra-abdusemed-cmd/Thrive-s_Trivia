# Supabase Setup Guide for Thrive Trivia

## Quick Setup Steps

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the SQL Schema**
   - Copy the entire contents of `supabase_schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Set Your First Admin User**
   After running the schema, manually set your admin user:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```

## Database Tables Created

### 1. `profiles`
- Stores user profiles with roles (user/admin)
- Automatically created when users sign up
- **Fields**: id, email, role, created_at, updated_at

### 2. `categories`
- Stores question categories
- **Fields**: id, name, created_at, updated_at
- **Admin only**: Create, update, delete

### 3. `questions`
- Stores MCQ questions
- **Fields**: id, category_id, question, option_a, option_b, option_c, option_d, correct, created_at, updated_at
- **Admin only**: Create, update, delete

### 4. `scores`
- Stores user game scores
- **Fields**: id, user_id, user_email, score, total_questions, created_at
- **Users**: Can insert their own scores
- **Everyone**: Can view all scores (for leaderboard)

## Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only modify their own data
- ✅ Admins have full CRUD access
- ✅ Automatic profile creation on signup
- ✅ Foreign key constraints for data integrity

## Testing the Setup

1. **Create a test category** (as admin):
   ```sql
   INSERT INTO categories (name) VALUES ('Test Category');
   ```

2. **Create a test question** (as admin):
   ```sql
   INSERT INTO questions (category_id, question, option_a, option_b, option_c, option_d, correct)
   VALUES (
     (SELECT id FROM categories LIMIT 1),
     'What is 2+2?',
     '4',
     '3',
     '5',
     '6',
     'a'
   );
   ```

3. **Verify RLS policies**:
   - Try accessing data as a regular user
   - Try accessing admin functions as a regular user (should fail)
   - Try accessing admin functions as an admin (should work)

## Troubleshooting

### Profile not created automatically?
If a user signs up but no profile is created:
```sql
INSERT INTO profiles (id, email, role)
VALUES ('user-uuid-here', 'user@email.com', 'user');
```

### Can't access admin panel?
Make sure your user has admin role:
```sql
SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
```

If role is 'user', update it:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Scores not showing in leaderboard?
Check if scores table has data:
```sql
SELECT * FROM scores ORDER BY score DESC LIMIT 10;
```

## Next Steps

1. ✅ Run the SQL schema
2. ✅ Set your admin user
3. ✅ Test creating categories and questions
4. ✅ Test playing a game and check if scores are saved
5. ✅ Verify leaderboard displays correctly

