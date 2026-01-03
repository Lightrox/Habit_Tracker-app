import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  return res.json({ 
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url
  });
}

