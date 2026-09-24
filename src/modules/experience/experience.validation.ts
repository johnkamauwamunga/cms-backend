import { z } from 'zod';

const dateInput = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), 'Invalid date');

export const createExperienceSchema = z
  .object({
    company: z.string().trim().min(1, 'Company is required').max(200),
    position: z.string().trim().min(1, 'Position is required').max(200),
    location: z.string().trim().max(200).nullable().optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    startDate: dateInput,
    endDate: dateInput.nullable().optional(),
    isCurrent: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict()
  // Rule 1: current role cannot have an end date.
  .refine(
    (data) => !(data.isCurrent === true && data.endDate),
    { message: 'isCurrent cannot be true when endDate is set', path: ['endDate'] },
  )
  // Rule 2: end date can't precede start date.
  .refine(
    (data) =>
      !data.endDate || data.endDate.getTime() >= data.startDate.getTime(),
    { message: 'endDate must be after startDate', path: ['endDate'] },
  );

export const updateExperienceSchema = z
  .object({
    company: z.string().trim().min(1).max(200).optional(),
    position: z.string().trim().min(1).max(200).optional(),
    location: z.string().trim().max(200).nullable().optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    startDate: dateInput.optional(),
    endDate: dateInput.nullable().optional(),
    isCurrent: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields to update',
  });

export const listExperienceQuerySchema = z
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

export const experienceIdParamSchema = z.object({
  id: z.string().uuid('Invalid experience id'),
});

export const reorderSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(500),
  })
  .strict();

export type CreateExperienceDto = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceDto = z.infer<typeof updateExperienceSchema>;