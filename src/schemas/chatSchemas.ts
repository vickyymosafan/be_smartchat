/**
 * Chat Validation Schemas
 * Schema validasi untuk request chat menggunakan Zod
 */

import { z } from 'zod';

/**
 * Schema untuk validasi chat request
 * 
 * Fields:
 * - message: string wajib, minimal 1 karakter
 * - userId: string opsional
 */
export const chatRequestSchema = z.object({
  message: z
    .string({
      required_error: 'Field message wajib diisi',
      invalid_type_error: 'Field message harus berupa string',
    })
    .min(1, 'Message tidak boleh kosong'),
  
  userId: z
    .string({
      invalid_type_error: 'Field userId harus berupa string',
    })
    .optional(),
});

/**
 * Type inference dari chatRequestSchema
 * Digunakan untuk type safety di service dan controller
 */
export type ChatRequest = z.infer<typeof chatRequestSchema>;
