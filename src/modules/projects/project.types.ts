import type {
  Project as PrismaProject,
  ProjectImage as PrismaProjectImage,
} from '@prisma/client';

export interface CreateProjectInput {
  name: string;
  slug?: string; // optional — auto-generated from name if omitted
  description: string;
  content?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  imageUrl?: string | null;
  displayOrder?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
}

export type UpdateProjectInput = Partial<Omit<CreateProjectInput, 'slug'>>;

export interface ListProjectQuery {
  page?: number;
  limit?: number;
  q?: string;
  featured?: boolean;
  includeUnpublished?: boolean;
}

export interface AddProjectImageInput {
  url: string;
  altText?: string | null;
  displayOrder?: number;
}

export interface UpdateProjectImageInput {
  url?: string;
  altText?: string | null;
  displayOrder?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** A project with its images loaded. */
export type ProjectWithImages = PrismaProject & {
  images: PrismaProjectImage[];
};

export type ProjectRecord = PrismaProject;
export type ProjectImageRecord = PrismaProjectImage;