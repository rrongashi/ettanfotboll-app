import { z } from 'zod';

/**
 * Schema for pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

