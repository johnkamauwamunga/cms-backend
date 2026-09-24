import { prisma } from '../../lib/prisma';
import type { Certification, Prisma } from '@prisma/client';

interface ListArgs {
  where: Prisma.CertificationWhereInput;
  orderBy: Prisma.CertificationOrderByWithRelationInput[];
  skip: number;
  take: number;
}

export const certificationRepository = {
  findById(id: string): Promise<Certification | null> {
    return prisma.certification.findUnique({ where: { id } });
  },

  findPublishedById(id: string): Promise<Certification | null> {
    return prisma.certification.findFirst({ where: { id, isPublished: true } });
  },

  create(data: Prisma.CertificationCreateInput): Promise<Certification> {
    return prisma.certification.create({ data });
  },

  update(id: string, data: Prisma.CertificationUpdateInput): Promise<Certification> {
    return prisma.certification.update({ where: { id }, data });
  },

  delete(id: string): Promise<Certification> {
    return prisma.certification.delete({ where: { id } });
  },

  async list({ where, orderBy, skip, take }: ListArgs): Promise<[Certification[], number]> {
    return prisma.$transaction([
      prisma.certification.findMany({ where, orderBy, skip, take }),
      prisma.certification.count({ where }),
    ]);
  },

  aggregateMaxDisplayOrder() {
    return prisma.certification.aggregate({ _max: { displayOrder: true } });
  },
};