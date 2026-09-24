import type { Experience as PrismaExperience } from '@prisma/client';

export interface CreateExperienceInput {
  company: string;
  position: string;
  location?: string | null;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  isCurrent?: boolean;
  displayOrder?: number;
  isPublished?: boolean;
}

export type UpdateExperienceInput = Partial<CreateExperienceInput>;

export interface ListExperienceQuery {
  page?: number;
  limit?: number;
  q?: string;
  includeUnpublished?: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ExperienceRecord = PrismaExperience;