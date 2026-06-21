export class AppError extends Error {
  public readonly errors: string[];
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500, errors: string[] = []) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

