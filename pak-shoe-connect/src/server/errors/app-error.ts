export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly correlationId?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    correlationId?: string,
    isOperational: boolean = true,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.correlationId = correlationId;
    this.isOperational = isOperational;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
