import { prisma } from '../../lib/prisma';
import type { Experience, Prisma } from '@prisma/client';

interface ListArgs {
  where: Prisma.ExperienceWhereInput;
  orderBy: Prisma.ExperienceOrderByWithRelationInput[];
  skip: number;
  take: number;
}

export const experienceRepository = {
  findById(id: string): Promise<Experience | null> {
    return prisma.experience.findUnique({ where: { id } });
  },

  findPublishedById(id: string): Promise<Experience | null> {
    return prisma.experience.findFirst({ where: { id, isPublished: true } });
  },

  create(data: Prisma.ExperienceCreateInput): Promise<Experience> {
    return prisma.experience.create({ data });
  },

  update(id: string, data: Prisma.ExperienceUpdateInput): Promise<Experience> {
    return prisma.experience.update({ where: { id }, data });
  },

  delete(id: string): Promise<Experience> {
    return prisma.experience.delete({ where: { id } });
  },

  async list({ where, orderBy, skip, take }: ListArgs): Promise<[Experience[], number]> {
    return prisma.$transaction([
      prisma.experience.findMany({ where, orderBy, skip, take }),
      prisma.experience.count({ where }),
    ]);
  },

  aggregateMaxDisplayOrder() {
    return prisma.experience.aggregate({ _max: { displayOrder: true } });
  },
};