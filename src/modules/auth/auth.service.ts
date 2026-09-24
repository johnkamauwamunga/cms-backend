import { createHash } from 'crypto';
import type { User } from '@prisma/client';

import { authRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../lib/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../lib/jwt';

import { ConflictError } from '../../errors/conflict.error';
import { AuthenticationError } from '../../errors/authentication.error';
import { NotFoundError } from '../../errors/not-found.error';

import type {
  AuthResult,
  AuthTokens,
  LoginInput,
  PublicUser,
  RefreshInput,
  RegisterInput,
} from './auth.types';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Refresh tokens are stored hashed (sha256 is fine here — they're random, not guessable). */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

async function issueTokens(user: User): Promise<AuthTokens> {
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await authRepository.createRefreshToken({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
    });

    const tokens = await issueTokens(user);
    return { user: toPublicUser(user), tokens };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await authRepository.findUserByEmail(input.email);

    // Same error for "no user" and "bad password" — do not leak which one it is.
    if (!user || !user.passwordHash) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is disabled');
    }

    const ok = await comparePassword(input.password, user.passwordHash);
    if (!ok) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokens = await issueTokens(user);
    return { user: toPublicUser(user), tokens };
  },

  /**
   * Rotates the refresh token: verifies the presented token, revokes it,
   * and issues a brand-new access + refresh pair.
   */
  async refresh(input: RefreshInput): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(input.refreshToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!stored) {
      throw new AuthenticationError('Refresh token not recognized');
    }
    if (stored.revokedAt) {
      // Reuse of a revoked token — likely theft. Nuke all sessions for this user.
      await authRepository.revokeAllUserRefreshTokens(stored.userId);
      throw new AuthenticationError('Refresh token has been revoked');
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      throw new AuthenticationError('Refresh token has expired');
    }
    if (stored.userId !== payload.sub) {
      throw new AuthenticationError('Refresh token does not match user');
    }
    if (!stored.user.isActive) {
      throw new AuthenticationError('Account is disabled');
    }

    await authRepository.revokeRefreshToken(stored.id);
    return issueTokens(stored.user);
  },

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    const stored = await authRepository.findRefreshTokenByHash(tokenHash);
    if (!stored || stored.revokedAt) return; // idempotent
    await authRepository.revokeRefreshToken(stored.id);
  },

  async me(userId: string): Promise<PublicUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User not found');
    return toPublicUser(user);
  },
};