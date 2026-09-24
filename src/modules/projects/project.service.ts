import { createHash } from 'crypto';
import { projectRepository } from './project.repository';
import { NotFoundError } from '../../errors/not-found.error';
import { ConflictError } from '../../errors/conflict.error';
import { ValidationError } from '../../errors/validation.error';

import type { Prisma, Project, ProjectImage } from '@prisma/client';
import type {
  AddProjectImageInput,
  CreateProjectInput,
  ListProjectQuery,
  Paginated,
  ProjectWithImages,
  UpdateProjectImageInput,
  UpdateProjectInput,
} from './project.types';

const DEFAULT_LIMIT = 50;
const SLUG_COLLISION_MAX = 50;

/** Turn a name into a URL-safe slug. */
function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'project';
}

/**
 * Find a free slug. Tries `base`, then `base-2`..`base-50`,
 * then falls back to `base-<6hex>` (guaranteed unique-ish).
 */
async function findFreeSlug(base: string): Promise<string> {
  const existing = await projectRepository.findBySlug(base);
  if (!existing) return base;

  for (let i = 2; i <= SLUG_COLLISION_MAX; i++) {
    const candidate = `${base}-${i}`;
    const hit = await projectRepository.findBySlug(candidate);
    if (!hit) return candidate;
  }

  const suffix = createHash('sha1')
    .update(`${base}-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .slice(0, 6);
  return `${base}-${suffix}`;
}

function buildWhere(
  query: ListProjectQuery,
  includeUnpublished: boolean,
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  if (!includeUnpublished) where.isPublished = true;

  if (query.featured !== undefined) {
    where.isFeatured = query.featured;
  }

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

function paginate(
  items: ProjectWithImages[],
  total: number,
  page: number,
  limit: number,
): Paginated<ProjectWithImages> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const projectService = {
  async listPublic(query: ListProjectQuery): Promise<Paginated<ProjectWithImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, false);

    const [items, total] = await projectRepository.list({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items as ProjectWithImages[], total, page, limit);
  },

  async listAdmin(query: ListProjectQuery): Promise<Paginated<ProjectWithImages>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, query.includeUnpublished ?? true);

    const [items, total] = await projectRepository.list({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items as ProjectWithImages[], total, page, limit);
  },

  async getPublicById(id: string): Promise<ProjectWithImages> {
    const item = await projectRepository.findPublishedByIdWithImages(id);
    if (!item) throw new NotFoundError('Project not found');
    return item;
  },

  async getPublicBySlug(slug: string): Promise<ProjectWithImages> {
    const item = await projectRepository.findBySlug(slug);
    if (!item || !item.isPublished) throw new NotFoundError('Project not found');
    const full = await projectRepository.findByIdWithImages(item.id);
    if (!full) throw new NotFoundError('Project not found');
    return full;
  },

  async getAdminById(id: string): Promise<ProjectWithImages> {
    const item = await projectRepository.findByIdWithImages(id);
    if (!item) throw new NotFoundError('Project not found');
    return item;
  },

  async create(input: CreateProjectInput): Promise<Project> {
    // Slug: explicit (validated, must be free) or generated (auto-resolved).
    let slug: string;
    if (input.slug) {
      const taken = await projectRepository.findBySlug(input.slug);
      if (taken) throw new ConflictError(`Slug "${input.slug}" is already in use`);
      slug = input.slug;
    } else {
      slug = await findFreeSlug(slugify(input.name));
    }

    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const { _max } = await projectRepository.aggregateMaxDisplayOrder();
      displayOrder = (_max.displayOrder ?? -1) + 1;
    }

    return projectRepository.create({
      name: input.name,
      slug,
      description: input.description,
      content: input.content ?? null,
      liveUrl: input.liveUrl ?? null,
      githubUrl: input.githubUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      displayOrder,
      isFeatured: input.isFeatured ?? false,
      isPublished: input.isPublished ?? false,
    });
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const existing = await projectRepository.findById(id);
    if (!existing) throw new NotFoundError('Project not found');

    const data: Prisma.ProjectUpdateInput = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.liveUrl !== undefined && { liveUrl: input.liveUrl }),
      ...(input.githubUrl !== undefined && { githubUrl: input.githubUrl }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
      ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
    };

    return projectRepository.update(id, data);
  },

  async remove(id: string): Promise<void> {
    const existing = await projectRepository.findById(id);
    if (!existing) throw new NotFoundError('Project not found');

    // Cascade removes ProjectImage rows (schema-level).
    // Files on disk are intentionally NOT deleted here — see notes above.
    await projectRepository.delete(id);
  },

  async reorder(ids: string[]): Promise<void> {
    const found = await Promise.all(ids.map((id) => projectRepository.findById(id)));
    if (found.some((x) => x === null)) {
      throw new NotFoundError('One or more projects not found');
    }
    await Promise.all(
      ids.map((id, index) => projectRepository.update(id, { displayOrder: index })),
    );
  },

  // ---------- images ----------

  async addImage(projectId: string, input: AddProjectImageInput): Promise<ProjectImage> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const { _max } = await projectRepository.aggregateMaxImageDisplayOrder(projectId);
      displayOrder = (_max.displayOrder ?? -1) + 1;
    }

    return projectRepository.createImage({
      project: { connect: { id: projectId } },
      url: input.url,
      altText: input.altText ?? null,
      displayOrder,
    });
  },

  async updateImage(
    projectId: string,
    imageId: string,
    input: UpdateProjectImageInput,
  ): Promise<ProjectImage> {
    const image = await projectRepository.findImageById(imageId);
    if (!image) throw new NotFoundError('Image not found');
    if (image.projectId !== projectId) {
      // The image exists but belongs to a different project — 404, not 403,
      // because from this route's perspective the resource doesn't exist.
      throw new NotFoundError('Image not found for this project');
    }

    const data: Prisma.ProjectImageUpdateInput = {
      ...(input.url !== undefined && { url: input.url }),
      ...(input.altText !== undefined && { altText: input.altText }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
    };

    return projectRepository.updateImage(imageId, data);
  },

  async removeImage(projectId: string, imageId: string): Promise<void> {
    const image = await projectRepository.findImageById(imageId);
    if (!image) throw new NotFoundError('Image not found');
    if (image.projectId !== projectId) {
      throw new NotFoundError('Image not found for this project');
    }
    await projectRepository.deleteImage(imageId);
  },

  async reorderImages(projectId: string, ids: string[]): Promise<void> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const found = await Promise.all(ids.map((id) => projectRepository.findImageById(id)));
    if (found.some((x) => x === null)) {
      throw new NotFoundError('One or more images not found');
    }
    if (found.some((x) => x!.projectId !== projectId)) {
      throw new ValidationError('One or more images do not belong to this project');
    }

    await Promise.all(
      ids.map((id, index) => projectRepository.updateImage(id, { displayOrder: index })),
    );
  },
};