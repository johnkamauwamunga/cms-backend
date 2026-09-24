import { prisma } from '../../lib/prisma';
import type { Prisma, Project, ProjectImage } from '@prisma/client';

interface ListArgs {
  where: Prisma.ProjectWhereInput;
  orderBy: Prisma.ProjectOrderByWithRelationInput[];
  skip: number;
  take: number;
}

export const projectRepository = {
  findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } });
  },

  findByIdWithImages(id: string): Promise<(Project & { images: ProjectImage[] }) | null> {
    return prisma.project.findUnique({
      where: { id },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    });
  },

  findPublishedByIdWithImages(
    id: string,
  ): Promise<(Project & { images: ProjectImage[] }) | null> {
    return prisma.project.findFirst({
      where: { id, isPublished: true },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    });
  },

  findBySlug(slug: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { slug } });
  },

  create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  },

  update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string): Promise<Project> {
    return prisma.project.delete({ where: { id } });
  },

  async list({
    where,
    orderBy,
    skip,
    take,
  }: ListArgs): Promise<[Project[], number]> {
    return prisma.$transaction([
      prisma.project.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      }),
      prisma.project.count({ where }),
    ]);
  },

  aggregateMaxDisplayOrder() {
    return prisma.project.aggregate({ _max: { displayOrder: true } });
  },

  // ---- images ----

  findImageById(imageId: string): Promise<ProjectImage | null> {
    return prisma.projectImage.findUnique({ where: { id: imageId } });
  },

  createImage(data: Prisma.ProjectImageCreateInput): Promise<ProjectImage> {
    return prisma.projectImage.create({ data });
  },

  updateImage(imageId: string, data: Prisma.ProjectImageUpdateInput): Promise<ProjectImage> {
    return prisma.projectImage.update({ where: { id: imageId }, data });
  },

  deleteImage(imageId: string): Promise<ProjectImage> {
    return prisma.projectImage.delete({ where: { id: imageId } });
  },

  aggregateMaxImageDisplayOrder(projectId: string) {
    return prisma.projectImage.aggregate({
      where: { projectId },
      _max: { displayOrder: true },
    });
  },
};