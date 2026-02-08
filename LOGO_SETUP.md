# Logo Setup Instructions

## Important: Move Logo to Public Folder

For Next.js to serve the logo image, it needs to be in the `public` folder.

### Steps:

1. **Copy the logo to public folder:**
   ```bash
   cp image/logo.png public/logo.png
   ```

   Or manually:
   - Copy `image/logo.png`
   - Paste it into `public/logo.png`

2. **Verify the file exists:**
   - Check that `public/logo.png` exists
   - The logo should now be accessible at `/logo.png`

## Logo Locations

The logo has been added to:

✅ **Navbar** - Replaces "Thrive Trivia 💜" text
✅ **AuthLanding** (Login/Signup page) - Above the title
✅ **Dashboard** - At the top of the page
✅ **Admin Panel** - At the top of the page
✅ **Leaderboard** - At the top of the page
✅ **Play Page** - At the top of the game interface

## Logo Sizes

- **Navbar**: 120x40px (auto height)
- **AuthLanding**: 200x80px
- **Dashboard**: 200x80px
- **Admin**: 180x60px
- **Leaderboard**: 200x80px
- **Play**: 180x60px

## Customizing Logo Size

To change logo size, edit the `width` and `height` props in the Image component:

```jsx
<Image 
  src="/logo.png" 
  alt="Thrive Trivia" 
  width={200}  // Change this
  height={80}  // Change this
  className="logo-image"
/>
```

## Troubleshooting

### Logo not showing?
1. Make sure `public/logo.png` exists
2. Check the file path is correct
3. Restart the Next.js dev server
4. Clear browser cache

### Logo too big/small?
- Adjust the `width` prop in the Image component
- The height will scale automatically

### Want different logo per page?
- Each page has its own Image component
- You can adjust sizes individually per page

