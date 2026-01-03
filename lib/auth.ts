import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCookie } from './cookies.js';
import { prisma } from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || '';

// Don't throw at module load time - check when actually using it
const getJwtSecret = () => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return JWT_SECRET;
};

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const getUserFromRequest = async (
  req: VercelRequest
): Promise<{ userId: string; email: string } | null> => {
  const token = getCookie(req, 'token');
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return payload;
  } catch {
    return null;
  }
};

export const requireAuth = async (
  req: VercelRequest,
  res: VercelResponse
): Promise<{ userId: string; email: string } | null> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  // Verify user still exists in database
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { id: true, email: true },
    });

    if (!dbUser) {
      res.status(401).json({ error: 'User not found' });
      return null;
    }

    return { userId: dbUser.id, email: dbUser.email };
  } catch (error) {
    console.error('Database error in requireAuth:', error);
    res.status(500).json({ error: 'Database error' });
    return null;
  }
};

