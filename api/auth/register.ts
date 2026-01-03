import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { generateToken } from '../../lib/auth';
import { setCookie } from '../../lib/cookies';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validated = registerSchema.parse(req.body);
    const { email, password } = validated;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    setCookie(res, 'token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    // Log full error for debugging
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
    });
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('P1001') || error.message.includes('connect')) {
        return res.status(500).json({ error: 'Database connection failed. Please check your DATABASE_URL.' });
      }
      if (error.message.includes('P2002')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}

