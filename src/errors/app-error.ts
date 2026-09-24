export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    errorCode?: string,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;

    // Subclasses automatically get the right name.
    this.name = new.target.name;

    // Clean stack trace (V8 only — harmless elsewhere).
    Error.captureStackTrace?.(this, new.target);
  }
}