import { ErrorCode } from './error-codes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: ErrorCode = 'INTERNAL_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 'FORBIDDEN', 403);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 'NOT_FOUND', 404);
  }

  static validation(message = 'Validation failed', details?: any): AppError {
    return new AppError(message, 'VALIDATION_ERROR', 400, details);
  }

  static badRequest(message: string, code: ErrorCode = 'VALIDATION_ERROR'): AppError {
    return new AppError(message, code, 400);
  }
}
