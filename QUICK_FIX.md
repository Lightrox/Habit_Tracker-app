# Quick Fix for 404 Errors

## The Problem
You're running `npm run dev` (Vite) which doesn't serve API routes. That's why you get 404 errors.

## Solution 1: Use Vercel Dev (Recommended)

1. **Stop the current server** (Ctrl+C in the terminal running Vite)

2. **Start Vercel dev server**:
   ```bash
   npm run dev:vercel
   ```

3. **If prompted to link project**, follow the prompts:
   - Choose "Set up and develop"
   - Link to existing or create new project

4. **Open the URL shown** (usually `http://localhost:3000`)

## Solution 2: Point to Deployed API (Quick Test)

If you have your app deployed on Vercel:

1. **Create `.env.local` file** in the root directory:
   ```env
   VITE_API_URL=https://your-app-name.vercel.app
   ```
   (Replace with your actual Vercel URL)

2. **Keep using `npm run dev`**

3. **Note:** This uses your production API, so all changes affect production!

## Solution 3: Check if Vercel Dev is Running

If you already ran `npm run dev:vercel`, check:
- What port is it running on? (Check terminal output)
- Make sure you're accessing that port, not 5173

## Which Solution to Use?

- **Solution 1** = Best for development (local API + database)
- **Solution 2** = Quick test if you have deployed app
- **Solution 3** = If vercel dev is already running

