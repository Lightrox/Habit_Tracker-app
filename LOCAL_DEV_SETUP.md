# Local Development Setup

## Problem
When running `npm run dev`, the API routes return 404 because Vite doesn't serve Vercel serverless functions.

## Solution: Use Vercel CLI for Local Development

### Option 1: Use Vercel Dev (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Link your project** (first time only):
```bash
vercel link
```
- Choose your existing project or create a new one
- This creates a `.vercel` folder with project settings

4. **Start development server**:
```bash
npm run dev:vercel
```

This will:
- Start the frontend on `http://localhost:3000` (or another port)
- Serve API routes from the `api/` folder
- Use your local `.env` file for environment variables

### Option 2: Point to Deployed API

If you want to use `npm run dev` and point to your deployed Vercel app:

1. **Create `.env.local` file**:
```env
VITE_API_URL=https://your-app.vercel.app
```

2. **Start Vite dev server**:
```bash
npm run dev
```

**Note:** This will use your production API, so all data changes will affect production!

### Option 3: Use Backend Server (Legacy)

If you have the `backend/` folder set up with Express:

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Create `.env.local` in root:
```env
VITE_API_URL=http://localhost:3001
```

3. Start frontend:
```bash
npm run dev
```

## Recommended: Use Option 1 (Vercel Dev)

This is the best option because:
- ✅ API routes work locally
- ✅ Uses local environment variables
- ✅ Matches production setup
- ✅ Hot reload for both frontend and API

