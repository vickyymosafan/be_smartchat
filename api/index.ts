/**
 * Vercel Serverless Function Handler
 * 
 * Entry point untuk Vercel deployment.
 * Vercel automatically wraps Express apps as serverless functions.
 * Prisma Client is initialized globally and handles connection pooling automatically.
 */

import { app } from '../src/server/app';

export default app;
