# One Category Per User Setup

## What This Does

Users can now only play each category **once**. Once they complete a category, it will no longer appear in their category selection.

## Database Migration Required

**IMPORTANT:** You need to run this SQL in Supabase to add the `category_id` column to the scores table:

```sql
-- Add category_id column to scores table
ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS scores_category_id_idx ON scores(category_id);
CREATE INDEX IF NOT EXISTS scores_user_category_idx ON scores(user_id, category_id);
```

## How It Works

1. **When user loads play page:**
   - System checks which categories the user has already played (from scores table)
   - Only shows categories that haven't been played yet

2. **When user completes a game:**
   - Score is saved with `category_id`
   - Category is marked as "played" for that user
   - Category won't appear in future selections

3. **If all categories are played:**
   - Shows a congratulatory message
   - User can check leaderboard or wait for new categories

## Features

✅ Users can only play each category once
✅ Played categories are automatically hidden
✅ Shows count of available categories
✅ Friendly message when all categories are completed
✅ Automatically updates after each game

## Testing

1. Run the SQL migration above
2. Log in as a user
3. Play a category
4. Try to play the same category again - it should be gone!
5. Play all categories - you'll see the completion message

## Notes

- Old scores without `category_id` will be ignored (they won't block categories)
- Only new games will track category completion
- Admins can still see all categories in the admin panel

