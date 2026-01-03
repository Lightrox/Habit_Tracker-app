import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check environment variables
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    // Test database connection
    let dbConnected = false;
    let dbError = null;
    
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
      console.error('Database connection error:', error);
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    return res.status(200).json({
      status: 'ok',
      environment: {
        DATABASE_URL: hasDatabaseUrl ? 'Set' : 'Missing',
        JWT_SECRET: hasJwtSecret ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV || 'Not set',
      },
      database: {
        connected: dbConnected,
        error: dbError,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

