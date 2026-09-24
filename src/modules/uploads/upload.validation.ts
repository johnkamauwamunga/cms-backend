import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';
import type { FileType } from '@prisma/client';

import { env } from '../../config/env';
import { ValidationError } from '../../errors/validation.error';

export const IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export const DOC_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const ALLOWED_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  ...DOC_MIME_TYPES,
]);

export function classifyFile(mimeType: string): FileType {
  if (IMAGE_MIME_TYPES.has(mimeType)) return 'IMAGE';
  if (mimeType === 'application/pdf') return 'PDF';
  if (DOC_MIME_TYPES.has(mimeType)) return 'DOCUMENT';
  return 'OTHER';
}

export function maxBytesFor(mimeType: string): number {
  return IMAGE_MIME_TYPES.has(mimeType)
    ? env.UPLOAD_MAX_IMAGE_BYTES
    : env.UPLOAD_MAX_DOC_BYTES;
}

/**
 * multer fileFilter. Rejects before the file is buffered, so an attacker
 * can't burn memory with a 1 GB "png".
 */
export function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new ValidationError(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
}