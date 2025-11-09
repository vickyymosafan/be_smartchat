/**
 * Auth Validation Schemas
 * Zod schemas untuk validasi PIN authentication
 */

import { z } from 'zod';

/**
 * Schema untuk PIN verification request
 */
export const pinVerifySchema = z.object({
  pin: z
    .string()
    .length(6, 'PIN harus 6 digit')
    .regex(/^\d+$/, 'PIN harus berupa angka'),
});

export type PinVerifyRequest = z.infer<typeof pinVerifySchema>;
