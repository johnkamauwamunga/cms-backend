import { z } from 'zod';

const nullableUrl = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .max(2048)
  .nullable();

const nullableString = (max: number) =>
  z.string().trim().max(max).nullable();

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    headline: nullableString(200).optional(),
    bio: z.string().trim().max(5000).nullable().optional(),
    location: nullableString(200).optional(),
    phone: nullableString(50).optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Invalid email')
      .max(255)
      .nullable()
      .optional(),
    website: nullableUrl.optional(),
    githubUrl: nullableUrl.optional(),
    linkedinUrl: nullableUrl.optional(),
    twitterUrl: nullableUrl.optional(),
    profileImageUrl: nullableUrl.optional(),
    bannerImageUrl: nullableUrl.optional(),
    isPublished: z.boolean().optional(),
  })
  .strict(); // reject unknown keys — prevents mass-assignment surprises

export const userIdParamSchema = z.object({
  userId: z.string().uuid('Invalid user id'),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;