import { profileRepository } from './profile.repository';
import { NotFoundError } from '../../errors/not-found.error';
import { AuthorizationError } from '../../errors/authorization.error';
import { ValidationError } from '../../errors/validation.error';

import type { Profile } from '@prisma/client';
import type { UpdateProfileInput } from './profile.types';

function emptyProfile(userId: string): Parameters<typeof profileRepository.create>[0] {
  return {
    user: { connect: { id: userId } },
    firstName: '',
    lastName: '',
  };
}

export const profileService = {
  /**
   * Returns the caller's own profile, creating an empty one on first access.
   * This avoids frontend "404 on first login" awkwardness.
   */
  async getOrCreateMine(userId: string): Promise<Profile> {
    const existing = await profileRepository.findByUserId(userId);
    if (existing) return existing;
    return profileRepository.create(emptyProfile(userId));
  },

  async update(userId: string, input: UpdateProfileInput): Promise<Profile> {
    // Confirm the profile exists (auto-create if it doesn't).
    const existing = await profileRepository.findByUserId(userId);
    if (!existing) {
      await profileRepository.create(emptyProfile(userId));
    }

    // Reject empty-string names — the schema requires non-null, so '' is allowed
    // by Prisma but is a UX bug. Zod already enforces min(1) if the key is present.
    if (Object.keys(input).length === 0) {
      throw new ValidationError('No fields to update');
    }

    return profileRepository.update(userId, input as Parameters<typeof profileRepository.update>[1]);
  },

  /**
   * Public view. Returns 404 for unpublished profiles rather than 403 —
   * do not confirm the existence of unpublished profiles to anonymous users.
   */
  async getPublic(userId: string): Promise<Profile> {
    const profile = await profileRepository.findPublishedByUserId(userId);
    if (!profile) throw new NotFoundError('Profile not found');
    return profile;
  },

  async listPublished(): Promise<Profile[]> {
    return profileRepository.listPublished();
  },

  async setPublished(userId: string, isPublished: boolean): Promise<Profile> {
    const existing = await profileRepository.findByUserId(userId);
    if (!existing) throw new NotFoundError('Profile not found');
    return profileRepository.update(userId, { isPublished });
  },

  async remove(userId: string): Promise<void> {
    const existing = await profileRepository.findByUserId(userId);
    if (!existing) throw new NotFoundError('Profile not found');
    await profileRepository.delete(userId);
  },
};

// Kept so the unused-import lint doesn't fire if you later add authorization
// checks that use it. Safe to delete if you don't want it.
void AuthorizationError;