/**
 * Vercel Serverless Function Handler
 * 
 * File ini mengkonversi Express app menjadi serverless function
 * yang dapat di-deploy ke Vercel.
 * 
 * Note: 
 * - Vercel akan otomatis menjalankan build command (npm run vercel-build)
 * - File ini akan di-compile ke dist/api/index.js
 * - Semua routes dari Express app akan tersedia di serverless function
 */

import serverless from 'serverless-http';
import { app } from '../src/server/app';

/**
 * Export Express app sebagai serverless function
 * serverless-http akan handle konversi request/response antara
 * Vercel serverless format dan Express format
 */
export default serverless(app);
