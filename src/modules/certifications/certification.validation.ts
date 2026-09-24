import { z } from 'zod';

const dateInput = z
  .union([z.string().datetime({ offset: true }), z.string().date(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), 'Invalid date');

const optionalUrl = z.string().trim().url('Must be a valid URL').max(2048).nullable().optional();
const optionalString = (max: number) => z.string().trim().max(max).nullable().optional();

export const createCertificationSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    issuer: z.string().trim().min(1, 'Issuer is required').max(200),
    description: z.string().trim().max(5000).nullable().optional(),
    issueDate: dateInput.nullable().optional(),
    expiryDate: dateInput.nullable().optional(),
    credentialId: optionalString(200),
    credentialUrl: optionalUrl,
    imageUrl: optionalUrl,
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      !data.issueDate ||
      !data.expiryDate ||
      data.expiryDate.getTime() >= data.issueDate.getTime(),
    { message: 'expiryDate must be after issueDate', path: ['expiryDate'] },
  );

export const updateCertificationSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    issuer: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    issueDate: dateInput.nullable().optional(),
    expiryDate: dateInput.nullable().optional(),
    credentialId: optionalString(200),
    credentialUrl: optionalUrl,
    imageUrl: optionalUrl,
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isPublished: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields to update',
  });

export const listCertificationQuerySchema = z
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

export const certificationIdParamSchema = z.object({
  id: z.string().uuid('Invalid certification id'),
});

export const reorderSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(500),
  })
  .strict();

export type CreateCertificationDto = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationDto = z.infer<typeof updateCertificationSchema>;