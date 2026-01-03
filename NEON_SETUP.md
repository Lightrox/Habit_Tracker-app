# Neon Database Setup Guide

## Step 1: Create Neon Account & Database

1. Go to https://neon.tech and sign up/login
2. Click "Create a project"
3. Choose a project name (e.g., "habit-tracker")
4. Select a region closest to you
5. Click "Create project"

## Step 2: Get Connection String

1. In your Neon dashboard, click on your project
2. Go to the **Connection Details** section
3. You'll see two connection strings:
   - **Direct connection** - for migrations
   - **Pooled connection** - for your application (recommended)

4. Copy the **pooled connection string** (it includes `-pooler` in the hostname)

## Step 3: Create .env File in Backend

Create a file named `.env` in the `backend` folder with this content:

```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Important Notes:**
- Replace the `DATABASE_URL` with your actual Neon connection string
- The connection string should include `?sslmode=require` (Neon requires SSL)
- For the `JWT_SECRET`, use a long random string (at least 32 characters)
- You can generate a JWT secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Step 4: Run Prisma Commands

In your backend directory, run:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

**Note:** For the first migration, Prisma might ask you to use the **direct connection** string (not pooled). You can:
- Temporarily use the direct connection string for migrations
- Or use the pooled connection string (it usually works too)

## Step 5: Verify Setup

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. You should see: "Server running on port 3001"

3. Try registering a user - it should work without errors!

## Troubleshooting

### Connection Issues
- Make sure your connection string includes `?sslmode=require`
- Check that you're using the pooled connection string for the app
- Verify your Neon project is active (free tier projects pause after inactivity)

### Migration Issues
- If migrations fail with pooled connection, use the direct connection string temporarily
- Make sure your DATABASE_URL is in quotes in the .env file

### Prisma Client Not Found
- Run `npx prisma generate` after setting up the .env file
- Make sure you're in the `backend` directory when running Prisma commands

