import type { UserRole } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

/** What we put inside the JWT and attach to req.user */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/** Safe user shape returned to the client (no passwordHash). */
export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}