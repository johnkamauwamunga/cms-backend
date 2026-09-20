import crypto from "node:crypto";

import {
  createRefreshToken,
  createUser,
  findUserByEmail,
} from "./auth.repository";

import {
  comparePassword,
  hashPassword,
} from "../../lib/password";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../lib/jwt";

import { RegisterInput, LoginInput } from "./auth.validation";

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUser(
    email,
    passwordHash
  );

  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  const refreshToken = generateRefreshToken(
    user.id
  );

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + 7
  );

  await createRefreshToken(
    user.id,
    tokenHash,
    expiresAt
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput) {
  const email = input.email.toLowerCase().trim();

  const user = await findUserByEmail(email);

  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await comparePassword(
    input.password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  const refreshToken = generateRefreshToken(
    user.id
  );

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + 7
  );

  await createRefreshToken(
    user.id,
    tokenHash,
    expiresAt
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}