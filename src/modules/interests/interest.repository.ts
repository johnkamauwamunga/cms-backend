import { prisma } from '../../lib/prisma';
import type { Interest, Prisma } from '@prisma/client';

interface ListArgs {
  where: Prisma.InterestWhereInput;
  orderBy: Prisma.InterestOrderByWithRelationInput[];
  skip: number;
  take: number;
}

export const interestRepository = {
  findById(id: string): Promise<Interest | null> {
    return prisma.interest.findUnique({ where: { id } });
  },

  findPublishedById(id: string): Promise<Interest | null> {
    return prisma.interest.findFirst({ where: { id, isPublished: true } });
  },

  create(data: Prisma.InterestCreateInput): Promise<Interest> {
    return prisma.interest.create({ data });
  },

  update(id: string, data: Prisma.InterestUpdateInput): Promise<Interest> {
    return prisma.interest.update({ where: { id }, data });
  },

  delete(id: string): Promise<Interest> {
    return prisma.interest.delete({ where: { id } });
  },

  /** Returns [items, total] atomically. */
  async list({
    where,
    orderBy,
    skip,
    take,
  }: ListArgs): Promise<[Interest[], number]> {
    return prisma.$transaction([
      prisma.interest.findMany({ where, orderBy, skip, take }),
      prisma.interest.count({ where }),
    ]);
  },

  maxDisplayOrder(): Promise<{ _max: { displayOrder: number | null } }> {
    return prisma.interest.aggregate({ _max: { displayOrder: true } });
  },
};