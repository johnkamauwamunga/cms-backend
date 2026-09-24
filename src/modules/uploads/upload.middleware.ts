import multer from 'multer';
import { fileFilter } from './upload.validation';
import { env } from '../../config/env';
import { ValidationError } from '../../errors/validation.error';

/**
 * We keep files in memory (multer.memoryStorage) so the storage driver
 * decides where they go. Max size is enforced per-request via a wrapper
 * (below) because multer's `limits.fileSize` is global.
 */
const MAX_ANY = Math.max(env.UPLOAD_MAX_IMAGE_BYTES, env.UPLOAD_MAX_DOC_BYTES);

export const uploadSingle = (fieldName = 'file') =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
      fileSize: MAX_ANY,
      files: 1,
    },
  }).single(fieldName);

/**
 * multer throws its own error class on size overflow (LIMIT_FILE_SIZE).
 * Translate it into our ValidationError so error.middleware.ts handles it.
 */
export function translateMulterError(err: unknown): unknown {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new ValidationError('File is too large');
    }
    return new ValidationError(`Upload error: ${err.code}`);
  }
  return err;
}