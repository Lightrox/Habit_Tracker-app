# How to Run the Habit Tracker App

## Prerequisites
- Node.js 24.x installed
- A Supabase account and project

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**To get your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**
5. Paste them into your `.env` file

### 3. Run the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173` (or another port if 5173 is taken).

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

