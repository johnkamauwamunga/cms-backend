import { prisma } from '../../lib/prisma';
import type { Profile, Prisma } from '@prisma/client';

export const profileRepository = {
  /**
   * Find a profile by its owner's user id.
   * Returns null if the user has no profile yet.
   */
  findByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { userId } });
  },

  /**
   * Public lookup — only returns the profile if it's published.
   * Used by the public GET /api/profile/:userId route.
   */
  findPublishedByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findFirst({
      where: { userId, isPublished: true },
    });
  },

  create(data: Prisma.ProfileCreateInput): Promise<Profile> {
    return prisma.profile.create({ data });
  },

  update(userId: string, data: Prisma.ProfileUpdateInput): Promise<Profile> {
    return prisma.profile.update({ where: { userId }, data });
  },

  /**
   * Toggle publish state. Separate from `update` because it's
   * a distinct business action, not a general field edit.
   */
  setPublished(userId: string, isPublished: boolean): Promise<Profile> {
    return prisma.profile.update({
      where: { userId },
      data: { isPublished },
    });
  },

  delete(userId: string): Promise<Profile> {
    return prisma.profile.delete({ where: { userId } });
  },

  /**
   * Public listing — published profiles only, newest first.
   * Add pagination here later if you grow past a handful of users.
   */
  listPublished(): Promise<Profile[]> {
    return prisma.profile.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Existence check without loading the whole row.
   * Useful when the service only needs a boolean.
   */
  async exists(userId: string): Promise<boolean> {
    const found = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    return found !== null;
  },
};