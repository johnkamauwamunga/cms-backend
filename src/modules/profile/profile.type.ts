import type { Profile as PrismaProfile } from '@prisma/client';

/** Fields the user can set on their own profile. */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  isPublished?: boolean;
}

/** Shape returned to the client. Same as the Prisma model, but explicit. */
export type PublicProfile = Omit<PrismaProfile, 'userId'> & {
  userId: string;
};