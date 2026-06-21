import type { Response } from "express";

import { dashboardService } from "../services/dashboard.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { successResponse } from "../utils/api-response.js";
import { getRequiredRouteParam } from "../utils/route-param.js";

export async function getDashboardOverview(
  request: AuthenticatedRequest,
  response: Response
) {
  const overview = await dashboardService.getOverview(request.authUser);

  response.json(successResponse("Dashboard overview fetched successfully", overview));
}

export async function getEventWishes(
  request: AuthenticatedRequest,
  response: Response
) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const data = await dashboardService.getEventWishes(
    eventId,
    request.authUser
  );

  response.json(successResponse("Event wishes fetched successfully", data));
}

export async function getEventGuestbook(
  request: AuthenticatedRequest,
  response: Response
) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const data = await dashboardService.getEventGuestbook(
    eventId,
    request.authUser
  );

  response.json(successResponse("Event guestbook fetched successfully", data));
}

export async function hideEventWish(request: AuthenticatedRequest, response: Response) {
  const wishId = getRequiredRouteParam(request.params.id, "id");
  const data = await dashboardService.hideEventWish(wishId, request.authUser);

  response.json(successResponse("Wish hidden successfully", data));
}
