import { z } from 'zod';

const optionalUrl = z.string().trim().url('Must be a valid URL').max(2048).nullable().optional();

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case');

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    slug: slugSchema.optional(),
    description: z.string().trim().min(1, 'Description is required').max(2000),
    content: z.string().max(50_000).nullable().optional(),
    liveUrl: optionalUrl,
    githubUrl: optionalUrl,
    imageUrl: optionalUrl,
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    content: z.string().max(50_000).nullable().optional(),
    liveUrl: optionalUrl,
    githubUrl: optionalUrl,
    imageUrl: optionalUrl,
    displayOrder: z.number().int().min(0).max(10_000).optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields to update',
  });

export const listProjectQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    q: z.string().trim().min(1).max(200).optional(),
    featured: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((v) => v === true || v === 'true')
      .optional(),
    includeUnpublished: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((v) => v === true || v === 'true')
      .optional(),
  })
  .strict();

export const projectIdParamSchema = z.object({
  id: z.string().uuid('Invalid project id'),
});

export const projectImageParamSchema = z.object({
  projectId: z.string().uuid('Invalid project id'),
  imageId: z.string().uuid('Invalid image id'),
});

export const addProjectImageSchema = z
  .object({
    url: z.string().trim().url('Must be a valid URL').max(2048),
    altText: z.string().trim().max(300).nullable().optional(),
    displayOrder: z.number().int().min(0).max(10_000).optional(),
  })
  .strict();

export const updateProjectImageSchema = z
  .object({
    url: z.string().trim().url().max(2048).optional(),
    altText: z.string().trim().max(300).nullable().optional(),
    displayOrder: z.number().int().min(0).max(10_000).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'No fields to update',
  });

export const reorderSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1).max(500),
  })
  .strict();

  export const projectSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Slug is required')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug'),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
export type AddProjectImageDto = z.infer<typeof addProjectImageSchema>;
export type UpdateProjectImageDto = z.infer<typeof updateProjectImageSchema>;