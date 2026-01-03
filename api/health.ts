import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[api/health] Handler invoked', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  try {
    // Check environment variables
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    
    // Test database connection (without importing prisma to avoid crashes)
    let dbConnected = false;
    let dbError = null;
    
    if (hasDatabaseUrl) {
      try {
        // Dynamic import to avoid crashes if Prisma isn't set up
        const { prisma } = await import('../lib/prisma.js');
        // Simple query to test connection
        await prisma.$queryRaw`SELECT 1 as test`;
        dbConnected = true;
      } catch (error) {
        dbError = error instanceof Error ? error.message : 'Unknown error';
        console.error('Database connection error:', error);
        // Don't disconnect in serverless - let Prisma handle it
      }
    } else {
      dbError = 'DATABASE_URL not set';
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
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
    });
  }
}

