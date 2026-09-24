import 'express';
import type { AccessTokenPayload } from '../lib/jwt';
import type { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: AccessTokenPayload;

      // multer adds these after upload middleware runs
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}

export {};