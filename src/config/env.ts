function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: Number(optional('PORT', '3000')),

  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),

  // Uploads
  UPLOAD_DIR: optional('UPLOAD_DIR', 'uploads'),
  UPLOAD_PUBLIC_PATH: optional('UPLOAD_PUBLIC_PATH', '/uploads'),
  UPLOAD_MAX_IMAGE_BYTES: Number(optional('UPLOAD_MAX_IMAGE_BYTES', String(5 * 1024 * 1024))),
  UPLOAD_MAX_DOC_BYTES: Number(optional('UPLOAD_MAX_DOC_BYTES', String(20 * 1024 * 1024))),

  BASE_URL: optional('BASE_URL', 'http://localhost:3000'),
} as const;

export const isProd = env.NODE_ENV === 'production';