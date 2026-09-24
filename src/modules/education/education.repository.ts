import { prisma } from '../../lib/prisma';
import type { Education, Prisma } from '@prisma/client';

interface ListArgs {
  where: Prisma.EducationWhereInput;
  orderBy: Prisma.EducationOrderByWithRelationInput[];
  skip: number;
  take: number;
}

export const educationRepository = {
  findById(id: string): Promise<Education | null> {
    return prisma.education.findUnique({ where: { id } });
  },

  findPublishedById(id: string): Promise<Education | null> {
    return prisma.education.findFirst({ where: { id, isPublished: true } });
  },

  create(data: Prisma.EducationCreateInput): Promise<Education> {
    return prisma.education.create({ data });
  },

  update(id: string, data: Prisma.EducationUpdateInput): Promise<Education> {
    return prisma.education.update({ where: { id }, data });
  },

  delete(id: string): Promise<Education> {
    return prisma.education.delete({ where: { id } });
  },

  async list({ where, orderBy, skip, take }: ListArgs): Promise<[Education[], number]> {
    return prisma.$transaction([
      prisma.education.findMany({ where, orderBy, skip, take }),
      prisma.education.count({ where }),
    ]);
  },

  aggregateMaxDisplayOrder() {
    return prisma.education.aggregate({ _max: { displayOrder: true } });
  },
};