import { z } from 'zod';

const dateInput = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), 'Invalid date');

export const createEducationSchema = z
  .object({
    institution: z.string().trim().min(1, 'Institution is required').max(200),
    degree: z.string().trim().min(1, 'Degree is required').max(200),
    field: z.string().trim().max(200).nullable().optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    startDate: dateInput,
    endDate: dateInput.nullable().optional(),
    isCurrent: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) => !(data.isCurrent === true && data.endDate),
    { message: 'isCurrent cannot be true when endDate is set', path: ['endDate'] },
  )
  .refine(
    (data) => !data.endDate || data.endDate.getTime() >= data.startDate.getTime(),
    { message: 'endDate must be after startDate', path: ['endDate'] },
  );

export const updateEducationSchema = z
  .object({
    institution: z.string().trim().min(1).max(200).optional(),
    degree: z.string().trim().min(1).max(200).optional(),
    field: z.string().trim().max(200).nullable().optional(),
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

export const listEducationQuerySchema = z
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

export const educationIdParamSchema = z.object({
  id: z.string().uuid('Invalid education id'),
});

export const reorderSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(500),
  })
  .strict();

export type CreateEducationDto = z.infer<typeof createEducationSchema>;
export type UpdateEducationDto = z.infer<typeof updateEducationSchema>;