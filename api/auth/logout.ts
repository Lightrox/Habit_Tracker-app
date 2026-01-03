import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearCookie } from '../../lib/cookies.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearCookie(res, 'token');
  return res.json({ message: 'Logged out successfully' });
}

