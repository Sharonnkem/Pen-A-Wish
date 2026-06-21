import type { NextFunction, Request, Response } from "express";

import { errorResponse } from "../utils/api-response.js";

export function notFoundHandler(
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  response.status(404).json(errorResponse("Route not found"));
}
