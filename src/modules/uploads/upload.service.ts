import path from 'path';

import { localStorage } from './storage/local.storage';
import { uploadRepository } from './upload.repository';
import { classifyFile, maxBytesFor } from './upload.validation';
import { ValidationError } from '../../errors/validation.error';
import { NotFoundError } from '../../errors/not-found.error';
import { logger } from '../../lib/logger';

import type { StorageDriver } from './storage/storage.interface';
import type { UploadedFileRecord, UploadResponse } from './upload.types';

/** Single place to swap the driver (local → S3 → R2). */
const storage: StorageDriver = localStorage;

function toResponse(file: {
  id: string;
  url: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  type: UploadedFileRecord['type'];
}): UploadResponse {
  return {
    id: file.id,
    url: file.url,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    type: file.type,
  };
}

export const uploadService = {
  async upload(
    file: Express.Multer.File | undefined,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Per-MIME size limit (multer only enforced the global max).
    const limit = maxBytesFor(file.mimetype);
    if (file.size > limit) {
      throw new ValidationError(
        `File exceeds the ${Math.round(limit / 1024 / 1024)} MB limit for ${file.mimetype}`,
      );
    }

    const fileType = classifyFile(file.mimetype);

    // 1. Write to disk (or wherever the driver points).
    const stored = await storage.save({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    // 2. Persist the DB row. If this fails, clean up the file.
    try {
      const row = await uploadRepository.create({
        originalName: stored.originalName,
        storedName: path.basename(stored.storedPath),
        mimeType: stored.mimeType,
        size: stored.size,
        type: fileType,
        path: stored.storedPath,
        url: stored.url,
      });

      return toResponse(row);
    } catch (err) {
      logger.error({ err, storedPath: stored.storedPath }, 'DB insert failed for upload, cleaning up file');
      await storage.delete(stored.storedPath);
      throw err;
    }
  },

  async getById(id: string): Promise<UploadedFileRecord> {
    const row = await uploadRepository.findById(id);
    if (!row) throw new NotFoundError('File not found');
    return row as UploadedFileRecord;
  },

  async remove(id: string): Promise<void> {
    const row = await uploadRepository.findById(id);
    if (!row) throw new NotFoundError('File not found');

    // Delete DB row first — if disk delete fails, we still have a consistent DB.
    await uploadRepository.deleteById(id);

    await storage.delete(row.path);
  },
};

export { storage as _storage };