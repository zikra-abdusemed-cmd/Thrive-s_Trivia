# Fix Email Rate Limit Error

## Quick Fix: Disable Email Confirmation (Recommended for Development)

### Option 1: Disable in Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Email Auth**
4. Find **"Enable email confirmations"**
5. **Turn it OFF** (toggle switch)
6. Save changes

This will allow users to sign up without email confirmation, bypassing the rate limit issue.

### Option 2: Update Code (Already Done)

The code has been updated to disable email confirmation in the signup call. However, you still need to disable it in Supabase settings for it to work properly.

## Why This Happens

Supabase has rate limits on sending emails to prevent abuse:
- Free tier: Limited emails per hour
- Email confirmations count toward this limit
- Too many signups = rate limit exceeded

## For Production

When you're ready for production:

1. **Enable email confirmation** in Supabase settings
2. **Set up a custom SMTP** (in Supabase → Settings → Auth → SMTP Settings)
   - This gives you higher rate limits
   - Or use a service like SendGrid, Mailgun, etc.

3. **Update the signup code** to remove the `options` parameter:
   ```javascript
   const { data, error } = await supabase.auth.signUp({ 
     email, 
     password
     // Remove options to enable email confirmation
   })
   ```

## Alternative: Use Magic Link (No Password)

You can also use passwordless authentication with magic links, which might have different rate limits:

```javascript
const { data, error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: 'https://your-app.com/callback'
  }
})
```

## Current Status

✅ Code updated to handle rate limit errors better
✅ Code updated to disable email confirmation in signup
⚠️ **You still need to disable email confirmation in Supabase Dashboard**

## Steps to Fix Right Now

1. Open Supabase Dashboard
2. Go to Authentication → Settings
3. Turn OFF "Enable email confirmations"
4. Try signing up again

The error should be resolved! 🎉

