import type { FileType } from '@prisma/client';

export interface UploadedFileRecord {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  type: FileType;
  path: string;
  url: string | null;
  createdAt: Date;
}

export interface UploadResponse {
  id: string;
  url: string | null;
  originalName: string;
  mimeType: string;
  size: number;
  type: FileType;
}