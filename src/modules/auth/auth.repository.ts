import { prisma } from "../../lib/prisma";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export function createUser(
  email: string,
  passwordHash: string
) {
  return prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });
}

export function createRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  return prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}