import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with error handling
function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    // Still create client but it will fail on first query
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

// Always reuse the same instance in serverless
globalForPrisma.prisma = prisma;

