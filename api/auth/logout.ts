import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearCookie } from '../../lib/cookies.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    clearCookie(res, 'token');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[api/auth/logout] Internal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
}

