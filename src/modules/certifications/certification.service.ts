import { certificationRepository } from './certification.repository';
import { NotFoundError } from '../../errors/not-found.error';
import { ValidationError } from '../../errors/validation.error';

import type { Certification, Prisma } from '@prisma/client';
import type {
  CreateCertificationInput,
  ListCertificationQuery,
  Paginated,
  UpdateCertificationInput,
} from './certification.types';

const DEFAULT_LIMIT = 50;

function buildWhere(
  query: ListCertificationQuery,
  includeUnpublished: boolean,
): Prisma.CertificationWhereInput {
  const where: Prisma.CertificationWhereInput = {};

  if (!includeUnpublished) where.isPublished = true;

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { issuer: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  return where;
}

function paginate(
  items: Certification[],
  total: number,
  page: number,
  limit: number,
): Paginated<Certification> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const certificationService = {
  async listPublic(query: ListCertificationQuery): Promise<Paginated<Certification>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, false);

    const [items, total] = await certificationRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { issueDate: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  async listAdmin(query: ListCertificationQuery): Promise<Paginated<Certification>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where = buildWhere(query, query.includeUnpublished ?? true);

    const [items, total] = await certificationRepository.list({
      where,
      orderBy: [{ displayOrder: 'asc' }, { issueDate: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(items, total, page, limit);
  },

  async getPublicById(id: string): Promise<Certification> {
    const item = await certificationRepository.findPublishedById(id);
    if (!item) throw new NotFoundError('Certification not found');
    return item;
  },

  async getAdminById(id: string): Promise<Certification> {
    const item = await certificationRepository.findById(id);
    if (!item) throw new NotFoundError('Certification not found');
    return item;
  },

  async create(input: CreateCertificationInput): Promise<Certification> {
    let displayOrder = input.displayOrder;
    if (displayOrder === undefined) {
      const { _max } = await certificationRepository.aggregateMaxDisplayOrder();
      displayOrder = (_max.displayOrder ?? -1) + 1;
    }

    return certificationRepository.create({
      name: input.name,
      issuer: input.issuer,
      description: input.description ?? null,
      issueDate: input.issueDate ?? null,
      expiryDate: input.expiryDate ?? null,
      credentialId: input.credentialId ?? null,
      credentialUrl: input.credentialUrl ?? null,
      imageUrl: input.imageUrl ?? null,
      displayOrder,
      isPublished: input.isPublished ?? false,
    });
  },

  async update(id: string, input: UpdateCertificationInput): Promise<Certification> {
    const existing = await certificationRepository.findById(id);
    if (!existing) throw new NotFoundError('Certification not found');

    const finalIssue = input.issueDate !== undefined ? input.issueDate : existing.issueDate;
    const finalExpiry = input.expiryDate !== undefined ? input.expiryDate : existing.expiryDate;

    if (finalIssue && finalExpiry && finalExpiry.getTime() < finalIssue.getTime()) {
      throw new ValidationError('expiryDate must be after issueDate', {
        expiryDate: ['expiryDate cannot be before issueDate'],
      });
    }

    const data: Prisma.CertificationUpdateInput = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.issuer !== undefined && { issuer: input.issuer }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.issueDate !== undefined && { issueDate: input.issueDate }),
      ...(input.expiryDate !== undefined && { expiryDate: input.expiryDate }),
      ...(input.credentialId !== undefined && { credentialId: input.credentialId }),
      ...(input.credentialUrl !== undefined && { credentialUrl: input.credentialUrl }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
    };

    return certificationRepository.update(id, data);
  },

  async remove(id: string): Promise<void> {
    const existing = await certificationRepository.findById(id);
    if (!existing) throw new NotFoundError('Certification not found');
    await certificationRepository.delete(id);
  },

  async reorder(ids: string[]): Promise<void> {
    const found = await Promise.all(ids.map((id) => certificationRepository.findById(id)));
    if (found.some((x) => x === null)) {
      throw new NotFoundError('One or more certifications not found');
    }
    await Promise.all(
      ids.map((id, index) => certificationRepository.update(id, { displayOrder: index })),
    );
  },
};