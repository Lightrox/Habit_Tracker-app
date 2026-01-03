# Step-by-Step Vercel Deployment Guide

## Prerequisites Checklist
- ✅ Neon database set up and running
- ✅ Application working locally
- ✅ GitHub account (recommended for easy deployment)

---

## Step 1: Prepare Your Code

### 1.1 Ensure everything is committed
```bash
git add .
git commit -m "Ready for deployment"
```

### 1.2 Push to GitHub (if not already)
```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

---

## Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

---

## Step 3: Login to Vercel

```bash
vercel login
```

This will open your browser to authenticate with Vercel.

---

## Step 4: Link Your Project

From your project root directory:

```bash
vercel link
```

You'll be asked:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (for first deployment)
- **Project name?** → Press Enter for default or enter a custom name
- **Directory?** → Press Enter (uses current directory)

---

## Step 5: Set Environment Variables

### Option A: Using Vercel CLI (Recommended)

```bash
# Set DATABASE_URL (paste your Neon connection string)
vercel env add DATABASE_URL production

# Set JWT_SECRET (generate a secure one first)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output, then:
vercel env add JWT_SECRET production

# Set NODE_ENV
vercel env add NODE_ENV production
# When prompted, enter: production
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `DATABASE_URL` = Your Neon connection string
   - `JWT_SECRET` = A secure random string (32+ characters)
   - `NODE_ENV` = `production`
5. Make sure to select **Production**, **Preview**, and **Development** for all variables

---

## Step 6: Run Database Migrations

Before deploying, make sure your production database has the schema:

```bash
# Set your production DATABASE_URL temporarily
# (Use the same Neon connection string you'll use in Vercel)
npx prisma migrate deploy
```

Or after deployment, you can run migrations from Vercel's deployment logs.

---

## Step 7: Deploy to Production

```bash
vercel --prod
```

This will:
1. Build your application
2. Deploy to production
3. Give you a production URL

---

## Step 8: Verify Deployment

1. Visit your production URL (shown after deployment)
2. Try registering a new user
3. Check the Vercel dashboard for any errors

---

## Step 9: Update Frontend API URL (If Needed)

If your frontend needs to know the production API URL, you can:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `VITE_API_URL` = Your Vercel deployment URL (or leave empty for relative paths)
3. Redeploy

---

## Troubleshooting

### Build Fails
- Check Vercel build logs in the dashboard
- Ensure `prisma generate` runs (it's in your build script)
- Verify all dependencies are in `package.json`

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly in Vercel
- Ensure your Neon database is not paused
- Check that connection string includes `?sslmode=require`

### API Routes Not Working
- Check that files in `/api` directory are properly exported
- Verify `vercel.json` configuration
- Check function logs in Vercel dashboard

### Prisma Client Errors
- The `postinstall` script should generate Prisma client automatically
- If not, add `prisma generate` to your build command

---

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch = automatic production deployment
- Every push to other branches = preview deployment

---

## Useful Commands

```bash
# View deployment logs
vercel logs

# View environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME

# Open project in browser
vercel open
```

