import type { NextFunction, Request, Response } from "express";

import { AppError } from "../app-error";

/**
 * Emits a typed 404 when no route matched the incoming request.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(
    new AppError({
      statusCode: 404,
      code: "not_found",
      message: `Route not found: ${req.method} ${req.originalUrl}`
    })
  );
}

/**
 * Converts thrown errors into a stable JSON response contract.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  const fallbackMessage = error instanceof Error ? error.message : "Unexpected server error";

  res.status(500).json({
    error: {
      code: "internal_server_error",
      message: fallbackMessage
    }
  });
}
