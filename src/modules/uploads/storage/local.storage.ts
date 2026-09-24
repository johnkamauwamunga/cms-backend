import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import { env } from '../../../config/env';
import { logger } from '../../../lib/logger';
import type {
  SaveFileInput,
  StorageDriver,
  StoredFile,
} from './storage.interface';

const ROOT = path.resolve(process.cwd(), env.UPLOAD_DIR);

/** Build a safe filename: <uuid>-<slug>.<ext>. */
function buildStoredName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const base = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';

  return `${randomUUID()}-${base}${ext || ''}`;
}

/** shard by year/month so no single directory gets huge. */
function shardFor(date = new Date()): string {
  const yyyy = String(date.getUTCFullYear());
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return path.join(yyyy, mm);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export const localStorage: StorageDriver = {
  async save(input: SaveFileInput): Promise<StoredFile> {
    const shard = shardFor();
    const dir = path.join(ROOT, shard);
    await ensureDir(dir);

    const storedName = buildStoredName(input.originalName);
    const absolutePath = path.join(dir, storedName);
    const storedPath = path.join(shard, storedName).split(path.sep).join('/');

    await fs.writeFile(absolutePath, input.buffer, { flag: 'wx' });

    return {
      storedPath,
      url: `${env.UPLOAD_PUBLIC_PATH}/${storedPath}`,
      size: input.buffer.byteLength,
      mimeType: input.mimeType,
      originalName: input.originalName,
    };
  },

  async delete(storedPath: string): Promise<void> {
    const absolute = path.resolve(ROOT, storedPath);

    // Defensive: refuse to delete anything outside ROOT.
    if (!absolute.startsWith(ROOT + path.sep) && absolute !== ROOT) {
      logger.warn({ storedPath, absolute }, 'Refusing to delete outside upload root');
      return;
    }

    try {
      await fs.unlink(absolute);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') {
        logger.warn({ err, storedPath }, 'Failed to delete stored file');
      }
    }
  },

  async exists(storedPath: string): Promise<boolean> {
    const absolute = path.resolve(ROOT, storedPath);
    if (!absolute.startsWith(ROOT + path.sep)) return false;
    try {
      await fs.access(absolute);
      return true;
    } catch {
      return false;
    }
  },
};