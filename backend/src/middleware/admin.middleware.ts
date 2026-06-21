import type { NextFunction, Request, RequestHandler, Response } from "express";

import { AppError } from "../utils/app-error.js";

export const requireAdmin: RequestHandler = (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  if (!request.authUser || request.authUser.role !== "admin") {
    return next(new AppError("Admin access required", 403));
  }

  return next();
};
