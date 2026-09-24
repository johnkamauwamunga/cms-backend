import { prisma } from '../../lib/prisma';
import type { File as PrismaFile, Prisma } from '@prisma/client';

export const uploadRepository = {
  create(data: Prisma.FileCreateInput): Promise<PrismaFile> {
    return prisma.file.create({ data });
  },

  findById(id: string): Promise<PrismaFile | null> {
    return prisma.file.findUnique({ where: { id } });
  },

  findByStoredName(storedName: string): Promise<PrismaFile | null> {
    return prisma.file.findFirst({ where: { storedName } });
  },

  deleteById(id: string): Promise<PrismaFile> {
    return prisma.file.delete({ where: { id } });
  },

  listByType(type: PrismaFile['type']) {
    return prisma.file.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });
  },
};