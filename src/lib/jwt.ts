import jwt from 'jsonwebtoken';           // ✅ default import only
import type { SignOptions } from 'jsonwebtoken';  // ✅ type-only, no runtime effect

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined. Set it in your environment.');
}

const ACCESS_EXPIRES_IN: SignOptions['expiresIn'] = '15m';
const REFRESH_EXPIRES_IN: SignOptions['expiresIn'] = '7d';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
}

export function generateAccessToken(userId: string, role: string): string {
  const payload: AccessTokenPayload = { sub: userId, role, type: 'access' };
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: ACCESS_EXPIRES_IN });
}

export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, type: 'refresh' };
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET as string) as AccessTokenPayload;
  if (decoded.type !== 'access') throw new Error('Invalid token type: expected access token');
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET as string) as RefreshTokenPayload;
  if (decoded.type !== 'refresh') throw new Error('Invalid token type: expected refresh token');
  return decoded;
}