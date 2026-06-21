import type { Request, Response } from "express";

import { successResponse } from "../utils/api-response.js";

export function getHealth(_request: Request, response: Response) {
  response.json(
    successResponse("Health check successful", {
      status: "ok",
      service: "pen-a-wish-backend",
      timestamp: new Date().toISOString()
    })
  );
}

