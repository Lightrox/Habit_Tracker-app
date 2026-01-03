# Fix: API Routes 404 on Vercel

## Problem
API routes return 404 on deployed Vercel app:
- `/api/logs/create` → 404
- `/api/logs/day` → 404
- `/api/auth/login` → 404

## Solution Steps

### 1. Verify API Folder Structure

Make sure your `api/` folder is at the **root** of your project:
```
/
├── api/           ← Must be at root
│   ├── auth/
│   └── logs/
├── lib/
├── src/
└── vercel.json
```

### 2. Check vercel.json Configuration

I've updated `vercel.json` to explicitly configure API routes. Make sure it includes:

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  }
}
```

### 3. Ensure API Files Export Correctly

Each API file must export a default async function:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Your code
}
```

### 4. Redeploy After Changes

After updating `vercel.json`:

1. **Commit the changes:**
   ```bash
   git add vercel.json
   git commit -m "Fix API routes configuration"
   git push
   ```

2. **Redeploy on Vercel:**
   - Go to Vercel Dashboard
   - Your project should auto-redeploy
   - Or trigger a new deployment manually

### 5. Verify Deployment

After redeploying, check:

1. **Vercel Dashboard → Deployments**
   - Look for "Functions" section
   - Should show your API routes listed

2. **Test API directly:**
   - `https://your-app.vercel.app/api/health`
   - Should return JSON, not 404

3. **Check build logs:**
   - Vercel Dashboard → Deployments → Click latest deployment
   - Look for "Detected API Routes" in build logs

### 6. If Still Not Working

Check these common issues:

- **API folder in .gitignore?** → Remove it if present
- **API files have correct extensions?** → Must be `.ts` (not `.js`)
- **Dependencies installed?** → `@vercel/node` must be in package.json
- **Build includes API folder?** → Check build logs

### 7. Manual Verification

Test if API routes are detected:

```bash
# In your project root
vercel dev
```

Look for output like:
```
> Detected API Routes:
  - api/auth/login
  - api/auth/register
  - api/logs/create
  ...
```

If you don't see this, the API routes aren't being detected.

## Next Steps

1. ✅ I've updated `vercel.json` with functions configuration
2. ⏭️ Commit and push the changes
3. ⏭️ Redeploy on Vercel
4. ⏭️ Test the API routes

After redeploying, the API routes should work!

