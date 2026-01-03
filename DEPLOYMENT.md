# Vercel Deployment Guide

## Prerequisites

1. PostgreSQL database (Neon, Supabase, or Railway)
2. Vercel account
3. Node.js 18+ installed locally

## Setup Steps

### 1. Database Setup

1. Create a PostgreSQL database on Neon, Supabase, or Railway
2. Copy the connection string (DATABASE_URL)

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="production"
```

Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Migration

Run Prisma migrations to set up the database schema:

```bash
npm install
npx prisma migrate dev --name init
```

Or if using production database:

```bash
npx prisma migrate deploy
```

### 4. Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project:
```bash
vercel link
```

4. Set environment variables in Vercel:
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

Or set them in the Vercel dashboard:
- Go to your project settings
- Navigate to Environment Variables
- Add: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`

5. Deploy:
```bash
vercel --prod
```

### 5. Post-Deployment

After deployment, run migrations on production:

```bash
npx prisma migrate deploy
```

Or set `DATABASE_URL` in your local `.env` to production and run:
```bash
npx prisma migrate deploy
```

## Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── me.ts
│   └── logs/
│       ├── create.ts
│       ├── day.ts
│       ├── week.ts
│       └── month.ts
├── lib/                    # Shared utilities
│   ├── prisma.ts          # Prisma client (serverless-safe)
│   ├── auth.ts            # JWT & auth helpers
│   └── cookies.ts         # Cookie utilities
├── prisma/
│   └── schema.prisma      # Database schema
└── src/                   # Frontend React app
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Logs
- `POST /api/logs/create` - Create or update daily log
- `GET /api/logs/day?date=YYYY-MM-DD` - Get log for specific day
- `GET /api/logs/week?year=YYYY&week=W` - Get weekly logs and summary
- `GET /api/logs/month?year=YYYY&month=M` - Get monthly logs and analytics

All log endpoints require authentication via httpOnly cookie.

## Troubleshooting

### Prisma Client Issues
If you see "Prisma Client not generated" errors:
```bash
npx prisma generate
```

### Connection Pool Exhaustion
The Prisma client is configured for serverless with connection pooling. Ensure your DATABASE_URL includes connection pooling parameters if using Neon or Supabase.

### CORS Issues
CORS is handled automatically by Vercel. Ensure cookies are sent with `credentials: 'include'` in fetch requests.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up `.env` file with local database URL

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run migrations:
```bash
npx prisma migrate dev
```

5. Start dev server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` and API routes will be available at `/api/*`.

