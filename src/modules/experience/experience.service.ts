import { experienceRepository } from './experience.repository';
import { NotFoundError } from '../../errors/not-found.error';
import { ValidationError } from '../../errors/validation.error';

import type { Experience, Prisma } from '@prisma/client';
import type {
  CreateExperienceInput,
  ListExperienceQuery,
  Paginated,
  UpdateExperienceInput,
} from './experience.types';

const DEFAULT_LIMIT = 50;

function buildWhere(
  query: ListExperienceQuery,
  includeUnpublished: boolean,
): Prisma.ExperienceWhereInput {
  const where: Prisma.ExperienceWhereInput = {};

  if (!includeUnpublished) where.isPublished = true;

  if (query.q) {
    where.OR = [
      { company: { contains: query.q, mode: 'insensitive' } },
      { position: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

function paginate(
  items: Experience[],
  total: number,
  page: number,
  limit: number,
): Paginated<Experience> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Normalize the isCurrent/endDate pair before writing.
 * If isCurrent is true, endDate must be null.
 */
function normalizeCurrent(
  isCurrent: boolean | undefined,
  endDate: Date | null | undefined,
  existingEndDate?: Date | null,
): { isCurrent?: boolean; endDate?: Date | null } {
  const current = isCurrent ?? false;
  if (current) {
    return { isCurrent: true, endDate: null };
  }
  // Not current — leave endDate as provided (or existing for partial updates)
  return {
    ...(isCurrent !== undefined && { isCurrent: false }),
    ...(endDate !== undefined && { endDate }),
    ...(endDate === undefined && existingEndDate !== undefined && { endDate: existingEndDate }),
  };
}

export const experienceService = {
  async listPublic(query: ListExperienceQuery): Promise<Paginated<Experience>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, false);

    const [items, total] = await experienceRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { startDate: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  async listAdmin(query: ListExperienceQuery): Promise<Paginated<Experience>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, query.includeUnpublished ?? true);

    const [items, total] = await experienceRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { startDate: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  async getPublicById(id: string): Promise<Experience> {
    const item = await experienceRepository.findPublishedById(id);
    if (!item) throw new NotFoundError('Experience not found');
    return item;
  },

  async getAdminById(id: string): Promise<Experience> {
    const item = await experienceRepository.findById(id);
    if (!item) throw new NotFoundError('Experience not found');
    return item;
  },

  async create(input: CreateExperienceInput): Promise<Experience> {
    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const { _max } = await experienceRepository.aggregateMaxDisplayOrder();
      displayOrder = (_max.displayOrder ?? -1) + 1;
    }

    const normalized = normalizeCurrent(input.isCurrent, input.endDate);

    return experienceRepository.create({
      company: input.company,
      position: input.position,
      location: input.location ?? null,
      description: input.description ?? null,
      startDate: input.startDate,
      endDate: normalized.endDate ?? null,
      isCurrent: normalized.isCurrent ?? false,
      displayOrder,
      isPublished: input.isPublished ?? false,
    });
  },

  async update(id: string, input: UpdateExperienceInput): Promise<Experience> {
    const existing = await experienceRepository.findById(id);
    if (!existing) throw new NotFoundError('Experience not found');

    // Merge with existing values so cross-field rules are checked against final state.
    const finalStart = input.startDate ?? existing.startDate;
    const finalEnd = input.endDate !== undefined ? input.endDate : existing.endDate;
    const finalCurrent = input.isCurrent ?? existing.isCurrent;

    if (finalCurrent && finalEnd) {
      throw new ValidationError('isCurrent cannot be true when endDate is set', {
        endDate: ['Unset endDate or set isCurrent to false'],
      });
    }
    if (finalEnd && finalEnd.getTime() < finalStart.getTime()) {
      throw new ValidationError('endDate must be after startDate', {
        endDate: ['endDate cannot be before startDate'],
      });
    }

    const data: Prisma.ExperienceUpdateInput = {
      ...(input.company !== undefined && { company: input.company }),
      ...(input.position !== undefined && { position: input.position }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
      // isCurrent/endDate handled together
      ...(finalCurrent
        ? { isCurrent: true, endDate: null }
        : {
            ...(input.isCurrent !== undefined && { isCurrent: input.isCurrent }),
            ...(input.endDate !== undefined && { endDate: input.endDate }),
          }),
    };

    return experienceRepository.update(id, data);
  },

  async remove(id: string): Promise<void> {
    const existing = await experienceRepository.findById(id);
    if (!existing) throw new NotFoundError('Experience not found');
    await experienceRepository.delete(id);
  },

  async reorder(ids: string[]): Promise<void> {
    const found = await Promise.all(ids.map((id) => experienceRepository.findById(id)));
    if (found.some((x) => x === null)) {
      throw new NotFoundError('One or more experiences not found');
    }

    await Promise.all(
      ids.map((id, index) => experienceRepository.update(id, { displayOrder: index })),
    );
  },
};