# Habit Tracker - Full Stack Application

A multi-device, authenticated habit tracking system built with React, TypeScript, Node.js, Express, PostgreSQL, and Prisma.

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Recharts

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/habit_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

4. Set up database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:3001):
```env
VITE_API_URL=http://localhost:3001
```

4. Start frontend dev server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user (protected)

### Daily Logs
- `POST /logs` - Create/update daily log (protected)
- `GET /logs/day/:date` - Get log for specific date (protected)
- `GET /logs/week/:year/:weekNumber` - Get weekly logs and summary (protected)
- `GET /logs/month/:year/:month` - Get monthly logs with aggregations (protected)

## Features

- User authentication with JWT
- Daily habit tracking (DSA, Meditation, Gym, Learning, Project)
- Weekly analysis with charts
- Monthly reports with heatmaps
- Streak tracking for all activities
- Multi-device support with persistent sessions

## Security

- Passwords hashed with bcrypt
- JWT stored in httpOnly cookies
- Input validation with Zod
- User data isolation (users can only access their own logs)
- Error handling without stack trace leaks
