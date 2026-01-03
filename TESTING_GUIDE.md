# Testing Guide

## Step 1: Link Your Project to Vercel

Run this command and follow the prompts:
```bash
vercel link
```

When prompted:
- **Set up and develop?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → Yes (if you have one) or No (to create new)
- **What's your project's name?** → Enter a name or select existing

This creates a `.vercel` folder with your project settings.

## Step 2: Start Development Server

Run:
```bash
npm run dev:vercel
```

This will:
- Start the frontend
- Serve API routes from the `api/` folder
- Use your local `.env` file

The server will start on `http://localhost:3000` (or another port if 3000 is busy).

## Step 3: Test the Application

### 3.1 Test Registration/Login
1. Open `http://localhost:3000` in your browser
2. Register a new account
3. Login with your credentials

### 3.2 Test Daily Tracking
1. Go to the Daily Tracking page
2. Select today's date
3. Check some activities (DSA, Meditation, Gym, etc.)
4. Fill in some details
5. Click "Save Day"
6. **Check browser console** for logs:
   - "Saving log:" - shows what's being saved
   - "Sending to API:" - shows API request
   - "API response:" - shows server response
   - "Refresh triggered" - confirms refresh mechanism

### 3.3 Test Data Persistence
1. After saving, change the date to a different day
2. Change back to the day you just saved
3. **Verify:** The data should still be there (not reset)

### 3.4 Test Monthly Report
1. Navigate to Monthly Report
2. **Verify:** The data you saved should appear in the heatmap
3. Check the summary cards show correct totals
4. Save another day and **verify** the report updates automatically

### 3.5 Test Weekly Analysis
1. Navigate to Weekly Analysis
2. **Verify:** Your saved data appears in the charts
3. Save another day in the same week
4. **Verify:** The weekly analysis updates automatically

### 3.6 Test Streaks
1. Navigate to Streaks page
2. **Verify:** Streaks are calculated based on your saved data
3. Save consecutive days
4. **Verify:** Streaks increase correctly

## Step 4: Check for Errors

Open browser console (F12) and look for:
- ✅ Green checkmarks = Success
- ❌ Red errors = Problems to fix

Common issues:
- **404 errors** → API routes not working (use `vercel dev`)
- **401 errors** → Not logged in
- **500 errors** → Server/database issue

## Step 5: Verify Database

If you want to check the database directly:
```bash
npx prisma studio
```

This opens a web interface to view your database records.

## Troubleshooting

### API routes return 404
- Make sure you're using `npm run dev:vercel` (not `npm run dev`)
- Check that `api/` folder exists with your route files

### Data not saving
- Check browser console for errors
- Verify DATABASE_URL is set in `.env`
- Check that you're logged in (cookies are set)

### Refresh not working
- Check console for "Refresh triggered" messages
- Verify `refreshTrigger` is incrementing
- Check that MonthlyReport/WeeklyAnalysis have `refreshTrigger` in dependencies

