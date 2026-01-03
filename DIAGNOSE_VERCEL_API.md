# Diagnosing Vercel API Routes 404

## Current Issue
API routes return 404 on Vercel deployment:
- `/api/logs/create` → 404
- `/api/logs/day` → 404
- `/api/auth/login` → 404

## Diagnostic Steps

### Step 1: Check Vercel Dashboard

1. Go to **Vercel Dashboard** → Your Project
2. Click on the **latest deployment**
3. Look for **"Functions"** tab or section
4. **What do you see?**
   - ✅ Functions listed → Routes are detected but not working
   - ❌ No Functions section → Routes aren't being detected

### Step 2: Check Build Logs

1. In the deployment, click **"Build Logs"**
2. Search for:
   - "Detected API Routes"
   - "Functions"
   - Any errors about API routes

**What do the build logs show?**

### Step 3: Test Health Endpoint

Try accessing directly in browser:
```
https://dsahabittracker.vercel.app/api/health
```

**What happens?**
- ✅ Returns JSON → API routes work, but specific routes have issues
- ❌ 404 → API routes aren't being detected at all

### Step 4: Verify File Structure

Your structure should be:
```
/
├── api/              ← At root level
│   ├── health.ts
│   ├── auth/
│   │   ├── login.ts
│   │   └── ...
│   └── logs/
│       ├── create.ts
│       └── ...
├── lib/
├── src/
└── vercel.json
```

### Step 5: Check if API Files Are Deployed

In Vercel Dashboard:
1. Go to **Deployment** → **Source**
2. Check if `api/` folder is visible in the source files

## Common Causes & Fixes

### Cause 1: API Files Not Committed to Git

**Fix:**
```bash
git add api/
git commit -m "Add API routes"
git push
```

Then redeploy on Vercel.

### Cause 2: API Folder in .gitignore

**Check:** Is `api/` in `.gitignore`? It shouldn't be.

**Fix:** Remove `api/` from `.gitignore` if present.

### Cause 3: Build Configuration Issue

**Check:** Does `vercel.json` have correct settings?

**Current vercel.json should be:**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --include=dev",
  "framework": "vite"
}
```

### Cause 4: Vercel Not Detecting TypeScript

**Fix:** Make sure:
- Files are `.ts` (TypeScript)
- Files export: `export default async function handler(...)`
- Files use `@vercel/node` types

## Quick Test

Create a simple test API route to verify detection:

**File: `api/test.ts`**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return res.json({ message: 'API routes are working!' });
}
```

Then:
1. Commit and push
2. Redeploy
3. Test: `https://dsahabittracker.vercel.app/api/test`

If this works, the issue is with specific routes. If it doesn't, Vercel isn't detecting API routes at all.

## Next Steps

Please check:
1. ✅ What does Vercel Dashboard → Functions tab show?
2. ✅ What do the build logs say about API routes?
3. ✅ Does `/api/health` work when accessed directly?
4. ✅ Are API files visible in the deployment source?

Share these results and I can help fix the specific issue!

