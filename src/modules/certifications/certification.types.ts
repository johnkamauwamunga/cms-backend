import type { Certification as PrismaCertification } from '@prisma/client';

export interface CreateCertificationInput {
  name: string;
  issuer: string;
  description?: string | null;
  issueDate?: Date | null;
  expiryDate?: Date | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}

export type UpdateCertificationInput = Partial<CreateCertificationInput>;

export interface ListCertificationQuery {
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

export type CertificationRecord = PrismaCertification;