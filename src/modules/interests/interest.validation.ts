import { z } from 'zod';

const optionalString = (max: number) =>
  z.string().trim().max(max).nullable().optional();

export const createInterestSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(150),
    description: z.string().trim().max(2000).nullable().optional(),
    icon: optionalString(255),
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict();

export const updateInterestSchema = createInterestSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields to update',
  });

export const listInterestsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    q: z.string().trim().min(1).max(200).optional(),
    includeUnpublished: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((v) => v === true || v === 'true')
      .optional(),
  })
  .strict();

export const interestIdParamSchema = z.object({
  id: z.string().uuid('Invalid interest id'),
});

export type CreateInterestDto = z.infer<typeof createInterestSchema>;
export type UpdateInterestDto = z.infer<typeof updateInterestSchema>;
export type ListInterestsQueryDto = z.infer<typeof listInterestsQuerySchema>;