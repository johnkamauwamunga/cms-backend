import 'express';
import type { AccessTokenPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: AccessTokenPayload;
    }
  }
}