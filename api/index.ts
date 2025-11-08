/**
 * Vercel Serverless Function Handler
 * 
 * Entry point untuk Vercel deployment.
 * File ini hanya export Express app tanpa wrapper serverless-http
 * karena Vercel akan otomatis handle itu.
 */

import { app } from '../src/server/app';

// Export Express app langsung untuk Vercel
export default app;
