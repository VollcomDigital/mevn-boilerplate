export interface AppErrorOptions {
  message: string;
  statusCode: number;
  code?: string;
  details?: unknown;
}

/**
 * Represents expected application failures that should be surfaced to clients.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  public constructor(options: AppErrorOptions) {
    super(options.message);

    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code ?? "app_error";
    this.details = options.details;
  }
}
