# Setup Guide

## Quick Start

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb habit_tracker

# Or using psql
psql -U postgres
CREATE DATABASE habit_tracker;
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/habit_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"' > .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start backend
npm run dev
```

### 3. Frontend Setup
```bash
# From root directory
npm install

# Optional: Create .env file
echo 'VITE_API_URL=http://localhost:3001' > .env

# Start frontend
npm run dev
```

## Project Structure

```
Habit_Tracker app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.ts
│   └── package.json
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── utils/
│   └── types/
└── package.json
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user  
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user (protected)

### Daily Logs
- `POST /logs` - Create/update daily log (protected)
- `GET /logs/day/:date` - Get log for date (protected)
- `GET /logs/week/:year/:weekNumber` - Get weekly data (protected)
- `GET /logs/month/:year/:month` - Get monthly data (protected)

## Features Implemented

✅ User authentication with JWT (httpOnly cookies)
✅ Password hashing with bcrypt
✅ Daily log CRUD operations
✅ Weekly aggregation with summary
✅ Monthly aggregation with heatmap
✅ Streak tracking
✅ Protected routes
✅ Multi-device support
✅ Input validation with Zod
✅ User data isolation

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT stored in httpOnly cookies
- CORS configured for frontend origin
- Input validation on all endpoints
- User can only access their own data
- Error messages don't leak stack traces
