import type { Education as PrismaEducation } from '@prisma/client';

export interface CreateEducationInput {
  institution: string;
  degree: string;
  field?: string | null;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  isCurrent?: boolean;
  displayOrder?: number;
  isPublished?: boolean;
}

export type UpdateEducationInput = Partial<CreateEducationInput>;

export interface ListEducationQuery {
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

export type EducationRecord = PrismaEducation;