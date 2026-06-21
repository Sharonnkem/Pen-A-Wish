import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/app-error.js";
import { errorResponse } from "../utils/api-response.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    response
      .status(400)
      .json(
        errorResponse(
          "Validation failed",
          error.issues.map((issue) => issue.message)
        )
      );
    return;
  }

  if (error instanceof AppError) {
    response
      .status(error.statusCode)
      .json(errorResponse(error.message, error.errors));
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  response.status(500).json(errorResponse(message));
}
