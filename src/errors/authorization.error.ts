import { AppError } from './app-error';

export class AuthorizationError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
  }
}