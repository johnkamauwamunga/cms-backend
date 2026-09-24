export interface StoredFile {
  /** Path relative to the storage root — persisted in the DB. */
  storedPath: string;
  /** Public URL (or null if not publicly reachable). */
  url: string | null;
  /** Size in bytes. */
  size: number;
  /** MIME type as reported by multer. */
  mimeType: string;
  /** Original filename from the client. */
  originalName: string;
}

export interface SaveFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StorageDriver {
  /** Persist a file and return its metadata. */
  save(input: SaveFileInput): Promise<StoredFile>;

  /** Remove a file by its stored path. Must not throw if missing. */
  delete(storedPath: string): Promise<void>;

  /** Whether a file exists at the given stored path. */
  exists(storedPath: string): Promise<boolean>;
}