import { educationRepository } from './education.repository';
import { NotFoundError } from '../../errors/not-found.error';
import { ValidationError } from '../../errors/validation.error';

import type { Education, Prisma } from '@prisma/client';
import type {
  CreateEducationInput,
  ListEducationQuery,
  Paginated,
  UpdateEducationInput,
} from './education.types';

const DEFAULT_LIMIT = 50;

function buildWhere(
  query: ListEducationQuery,
  includeUnpublished: boolean,
): Prisma.EducationWhereInput {
  const where: Prisma.EducationWhereInput = {};

  if (!includeUnpublished) where.isPublished = true;

  if (query.q) {
    where.OR = [
      { institution: { contains: query.q, mode: 'insensitive' } },
      { degree: { contains: query.q, mode: 'insensitive' } },
      { field: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

function paginate(
  items: Education[],
  total: number,
  page: number,
  limit: number,
): Paginated<Education> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const educationService = {
  async listPublic(query: ListEducationQuery): Promise<Paginated<Education>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, false);

    const [items, total] = await educationRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { startDate: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  async listAdmin(query: ListEducationQuery): Promise<Paginated<Education>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, query.includeUnpublished ?? true);

    const [items, total] = await educationRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { startDate: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  async getPublicById(id: string): Promise<Education> {
    const item = await educationRepository.findPublishedById(id);
    if (!item) throw new NotFoundError('Education not found');
    return item;
  },

  async getAdminById(id: string): Promise<Education> {
    const item = await educationRepository.findById(id);
    if (!item) throw new NotFoundError('Education not found');
    return item;
  },

  async create(input: CreateEducationInput): Promise<Education> {
    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const { _max } = await educationRepository.aggregateMaxDisplayOrder();
      displayOrder = (_max.displayOrder ?? -1) + 1;
    }

    const isCurrent = input.isCurrent ?? false;
    const endDate = isCurrent ? null : input.endDate ?? null;

    return educationRepository.create({
      institution: input.institution,
      degree: input.degree,
      field: input.field ?? null,
      description: input.description ?? null,
      startDate: input.startDate,
      endDate,
      isCurrent,
      displayOrder,
      isPublished: input.isPublished ?? false,
    });
  },

  async update(id: string, input: UpdateEducationInput): Promise<Education> {
    const existing = await educationRepository.findById(id);
    if (!existing) throw new NotFoundError('Education not found');

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

    const data: Prisma.EducationUpdateInput = {
      ...(input.institution !== undefined && { institution: input.institution }),
      ...(input.degree !== undefined && { degree: input.degree }),
      ...(input.field !== undefined && { field: input.field }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
      ...(finalCurrent
        ? { isCurrent: true, endDate: null }
        : {
            ...(input.isCurrent !== undefined && { isCurrent: input.isCurrent }),
            ...(input.endDate !== undefined && { endDate: input.endDate }),
          }),
    };

    return educationRepository.update(id, data);
  },

  async remove(id: string): Promise<void> {
    const existing = await educationRepository.findById(id);
    if (!existing) throw new NotFoundError('Education not found');
    await educationRepository.delete(id);
  },

  async reorder(ids: string[]): Promise<void> {
    const found = await Promise.all(ids.map((id) => educationRepository.findById(id)));
    if (found.some((x) => x === null)) {
      throw new NotFoundError('One or more education entries not found');
    }

    await Promise.all(
      ids.map((id, index) => educationRepository.update(id, { displayOrder: index })),
    );
  },
};