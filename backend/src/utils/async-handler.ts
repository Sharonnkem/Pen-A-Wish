import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler<TRequest extends Request = Request>(
  handler: (
    request: TRequest,
    response: Response,
    next: NextFunction
  ) => Promise<unknown>
): RequestHandler {
  return (request, response, next) => {
    void handler(request as TRequest, response, next).catch(next);
  };
}
