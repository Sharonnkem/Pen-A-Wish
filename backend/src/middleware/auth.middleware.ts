import type { NextFunction, Request, RequestHandler, Response } from "express";

import { findUserById } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth: RequestHandler = (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);
    void findUserById(payload.sub)
      .then((user) => {
        if (!user) {
          next(new AppError("Authentication required", 401));
          return;
        }

        request.authUser = {
          email: user.email,
          id: user.id,
          name: user.name,
          role: user.role
        };

        next();
      })
      .catch(() => next(new AppError("Authentication required", 401)));

    return;
  } catch {
    return next(new AppError("Authentication required", 401));
  }
};
