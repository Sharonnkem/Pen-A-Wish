import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/auth.js";
import { successResponse } from "../utils/api-response.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import { wishWallService } from "../services/wish-wall.service.js";
import { wishWallSettingsSchema } from "../validators/wish-wall.validator.js";

export async function getWishWallSettings(
  request: AuthenticatedRequest,
  response: Response
) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const settings = await wishWallService.getSettings(eventId, request.authUser);

  response.json(successResponse("Wish wall settings fetched successfully", { settings }));
}

export async function updateWishWallSettings(
  request: AuthenticatedRequest,
  response: Response
) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const payload = wishWallSettingsSchema.parse(request.body);
  const settings = await wishWallService.updateSettings(
    eventId,
    request.authUser,
    payload
  );

  response.json(successResponse("Wish wall settings updated successfully", { settings }));
}
