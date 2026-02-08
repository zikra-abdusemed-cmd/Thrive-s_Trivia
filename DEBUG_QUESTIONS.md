# Debugging Questions Not Loading

## Issue
Questions are in the database but not being fetched for users in the play page.

## Debugging Steps Added

1. **Enhanced Logging**
   - Added console.log when category is selected
   - Added console.log for query result
   - Added console.log for questions data
   - Added console.log for number of questions found

2. **Improved Error Handling**
   - Better error messages
   - Checks if data is an array
   - Handles both `data` and `data.data` formats
   - Increased timeout to 10 seconds

3. **Query Structure**
   - Using: `supabase.from('questions').select('*').eq('category_id', category)`
   - Category ID should be a UUID string
   - RLS policy allows anyone to view questions

## How to Debug

1. **Open Browser Console** (F12)
2. **Select a category** in the play page
3. **Check console logs** for:
   - "Category selected: [id] [name]"
   - "Loading questions for category: [id]"
   - "Questions query result: [result]"
   - "Questions data: [data]"
   - "Number of questions found: [count]"

## Common Issues to Check

### 1. Category ID Mismatch
- Verify the category ID in the database matches what's being sent
- Check if category_id in questions table is a UUID
- Check if the category button is passing the correct ID

### 2. RLS Policy Issues
- Verify RLS policy "Anyone can view questions" is active
- Check if user is authenticated (might need to be logged in)
- Verify the policy uses `USING (true)` for SELECT

### 3. Data Format Issues
- Check if Supabase is returning data in expected format
- Verify `result.data` is an array
- Check if there are any nested data structures

### 4. Network Issues
- Check Network tab in DevTools
- Look for failed requests to Supabase
- Check for CORS errors
- Verify Supabase URL and keys are correct

## Quick Test Query

You can test directly in Supabase SQL Editor:

```sql
-- Check if questions exist
SELECT * FROM questions;

-- Check questions for a specific category
SELECT * FROM questions WHERE category_id = 'YOUR_CATEGORY_ID';

-- Check category IDs
SELECT id, name FROM categories;
```

## Next Steps

1. Check browser console for the debug logs
2. Verify the category ID being used matches database
3. Check Supabase dashboard for RLS policies
4. Test the query directly in Supabase SQL Editor
5. Check Network tab for any failed requests

