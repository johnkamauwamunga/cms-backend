import { interestRepository } from './interest.repository';
import { NotFoundError } from '../../errors/not-found.error';

import type { Interest, Prisma } from '@prisma/client';
import type {
  CreateInterestInput,
  ListInterestsQuery,
  Paginated,
  UpdateInterestInput,
} from './interest.types';

const DEFAULT_LIMIT = 50;

function buildWhere(
  query: ListInterestsQuery,
  includeUnpublished: boolean,
): Prisma.InterestWhereInput {
  const where: Prisma.InterestWhereInput = {};

  if (!includeUnpublished) {
    where.isPublished = true;
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
  items: Interest[],
  total: number,
  page: number,
  limit: number,
): Paginated<Interest> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const interestService = {
  /** Public list — only published items. */
  async listPublic(query: ListInterestsQuery): Promise<Paginated<Interest>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;

    const where = buildWhere(query, false);
    const [items, total] = await interestRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  /** Admin list — may include unpublished if requested. */
  async listAdmin(query: ListInterestsQuery): Promise<Paginated<Interest>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const includeUnpublished = query.includeUnpublished ?? true;

    const where = buildWhere(query, includeUnpublished);
    const [items, total] = await interestRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  async getPublicById(id: string): Promise<Interest> {
    const item = await interestRepository.findPublishedById(id);
    if (!item) throw new NotFoundError('Interest not found');
    return item;
  },

  async getAdminById(id: string): Promise<Interest> {
    const item = await interestRepository.findById(id);
    if (!item) throw new NotFoundError('Interest not found');
    return item;
  },

  async create(input: CreateInterestInput): Promise<Interest> {
    // If no displayOrder provided, append to the end.
    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const { _max } = await interestRepository.maxDisplayOrder();
      displayOrder = (_max.displayOrder ?? -1) + 1;
    }

    return interestRepository.create({
      name: input.name,
      description: input.description ?? null,
      icon: input.icon ?? null,
      displayOrder,
      isPublished: input.isPublished ?? false,
    });
  },

  async update(id: string, input: UpdateInterestInput): Promise<Interest> {
    const existing = await interestRepository.findById(id);
    if (!existing) throw new NotFoundError('Interest not found');

    return interestRepository.update(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
    });
  },

  async remove(id: string): Promise<void> {
    const existing = await interestRepository.findById(id);
    if (!existing) throw new NotFoundError('Interest not found');
    await interestRepository.delete(id);
  },

  async reorder(ids: string[]): Promise<void> {
    // Bulk reorder — one transaction. Validates every id exists first.
    const found = await Promise.all(ids.map((id) => interestRepository.findById(id)));
    if (found.some((x) => x === null)) {
      throw new NotFoundError('One or more interests not found');
    }

    await Promise.all(
      ids.map((id, index) => interestRepository.update(id, { displayOrder: index })),
    );
  },
};