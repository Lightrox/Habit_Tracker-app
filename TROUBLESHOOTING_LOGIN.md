# Troubleshooting Login Issues

## Problem: Can't Login / 404 Errors

### Check 1: Are you using the right dev server?

**❌ Wrong:** `npm run dev` (Vite - port 5173)
- This doesn't serve API routes
- You'll get 404 errors for `/api/*` endpoints

**✅ Correct:** `npm run dev:vercel` (Vercel Dev)
- This serves both frontend AND API routes
- Usually runs on port 3000

### Steps to Fix:

1. **Stop current server:**
   - Find terminal running `npm run dev`
   - Press `Ctrl+C`

2. **Start Vercel dev:**
   ```bash
   npm run dev:vercel
   ```

3. **If prompted to link:**
   - Answer "Yes" to "Set up and develop"
   - Link to existing project or create new

4. **Use the correct URL:**
   - Check terminal output for the URL (usually `http://localhost:3000`)
   - **NOT** `http://localhost:5173`

### Check 2: Browser Console Errors

Open browser console (F12) and check:

- **404 errors** → Wrong dev server (use vercel dev)
- **401 errors** → Wrong credentials or user doesn't exist
- **500 errors** → Database/backend issue
- **CORS errors** → API URL misconfigured

### Check 3: Environment Variables

Make sure you have a `.env` file with:
```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
```

### Check 4: Database Connection

Test if database is working:
```bash
npx prisma studio
```

If this fails, your DATABASE_URL might be wrong.

### Check 5: User Exists?

If you get "Invalid credentials":
- Make sure you registered first
- Try registering a new account
- Check database with `npx prisma studio`

## Quick Test:

1. Open browser console (F12)
2. Try to login
3. Check console for errors:
   - **404** → Use `npm run dev:vercel`
   - **401** → Wrong email/password or user doesn't exist
   - **500** → Database/backend issue

## Still Not Working?

Share:
1. What error message you see
2. Browser console errors (F12)
3. Terminal output from `npm run dev:vercel`
4. Whether you're using port 3000 or 5173

