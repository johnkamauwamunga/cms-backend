import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

export function generateAccessToken(
  userId: string,
  role: string
): string {
  const payload: AccessTokenPayload = {
    sub: userId,
    role,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = {
    sub: userId,
    type: "refresh",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
}