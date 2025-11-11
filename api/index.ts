/**
 * Vercel Serverless Function Handler
 * 
 * Entry point untuk Vercel deployment.
 * Vercel automatically wraps Express apps as serverless functions.
 * 
 * Important:
 * - Prisma Client is initialized globally (see src/infra/db/prisma.ts)
 * - No need to call prisma.$connect() or prisma.$disconnect() per request
 * - Prisma handles connection pooling automatically
 */

import { app } from '../src/server/app';

// Export Express app for Vercel
// Vercel will handle the serverless wrapper automatically
export default app;
