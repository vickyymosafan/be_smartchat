import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z
    .string({
      required_error: 'Field message wajib diisi',
      invalid_type_error: 'Field message harus berupa string',
    })
    .min(1, 'Message tidak boleh kosong'),
  
  sessionId: z
    .string({
      invalid_type_error: 'Field sessionId harus berupa string',
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
