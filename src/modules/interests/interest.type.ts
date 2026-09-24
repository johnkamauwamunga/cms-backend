import type { Interest as PrismaInterest } from '@prisma/client';

export interface CreateInterestInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}

export type UpdateInterestInput = Partial<CreateInterestInput>;

export interface ListInterestsQuery {
  page?: number;
  limit?: number;
  q?: string;
  includeUnpublished?: boolean; // honored only for admins
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type InterestRecord = PrismaInterest;