# CSS Location Guide

## Current CSS Structure

Since Tailwind was removed, **all CSS is inline in each component** using `styled-jsx`. Here's where to find and edit CSS:

## Global CSS (Applies to Everything)

**File:** `styles/globals.css`
- Global resets (margin, padding, box-sizing)
- Body background gradient (purple/pink)
- Font family settings

## Page-Specific CSS

### 1. **Homepage / Login-Signup Landing**
**File:** `components/AuthLanding.js`
- Look for: `<style jsx>{` around line 201
- Contains: Landing page, login/signup form styles

### 2. **Login Page**
**File:** `app/login/page.js`
- Look for: `<style jsx>{` around line 83
- Contains: Login form styles

### 3. **Signup Page**
**File:** `app/signup/page.js`
- Look for: `<style jsx>{` around line 35
- Contains: Signup form styles

### 4. **Dashboard Page**
**File:** `app/dashboard/page.js`
- Look for: `<style jsx>{` around line 93
- Contains: Dashboard cards and layout

### 5. **Play Page**
**File:** `app/play/page.js`
- Look for: `<style jsx>{` around lines 228 and 361
- Contains: Game interface, timer, score display, categories

### 6. **Leaderboard Page**
**File:** `app/leaderboard/page.js`
- Look for: `<style jsx>{` around line 78
- Contains: Leaderboard list and ranking styles

### 7. **Admin Page**
**File:** `app/admin/page.js`
- Look for: `<style jsx>{` around line 524
- Contains: Admin panel, forms, buttons, tables

## Component CSS

### 1. **Navbar**
**File:** `components/Navbar.js`
- Look for: `<style jsx>{` around line 84
- Contains: Navigation bar, links, logout button

### 2. **Question Card**
**File:** `components/QuestionCard.js`
- Look for: `<style jsx>{` around line 29
- Contains: Question card, option buttons, correct/incorrect states

## Brand Colors (Purple & Pink)

The main brand colors used throughout:
- **Purple:** `#9333ea`
- **Pink:** `#ec4899`
- **Light Pink:** `#fce7f3`
- **Light Purple:** `#f3e8ff`

## Quick Tips

1. **To change colors globally:** Search and replace in all files:
   - `#9333ea` (purple)
   - `#ec4899` (pink)
   - `#fce7f3` (light pink)
   - `#f3e8ff` (light purple)

2. **To change fonts:** Edit `styles/globals.css` body font-family

3. **To change background:** Edit `styles/globals.css` body background

4. **To change specific page:** Find the page file and look for `<style jsx>{`

## Example: Change All Purple to Blue

1. Open each file with `<style jsx>`
2. Find and replace: `#9333ea` → `#3b82f6` (or your blue)
3. Find and replace: `#ec4899` → `#60a5fa` (or your blue)

## Want a Centralized CSS File Instead?

If you prefer having all CSS in one place, I can help you:
1. Create a single CSS file
2. Move all styles there
3. Import it in each component

Let me know if you'd like this approach!

