import type { Response } from "express";

import { adminService } from "../services/admin.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { successResponse } from "../utils/api-response.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import {
  adminEventsQuerySchema,
  adminGiftsQuerySchema,
  adminReportsQuerySchema,
  adminUsersQuerySchema,
  adminWishesQuerySchema,
  adminWithdrawalsQuerySchema
} from "../validators/admin.validator.js";

export async function getAdminUsers(request: AuthenticatedRequest, response: Response) {
  const query = adminUsersQuerySchema.parse(request.query);
  const data = await adminService.getUsers(query);

  response.json(successResponse("Admin users fetched successfully", data));
}

export async function getAdminEvents(request: AuthenticatedRequest, response: Response) {
  const query = adminEventsQuerySchema.parse(request.query);
  const data = await adminService.getEvents(query);

  response.json(successResponse("Admin celebrations fetched successfully", data));
}

export async function getAdminWishes(request: AuthenticatedRequest, response: Response) {
  const query = adminWishesQuerySchema.parse(request.query);
  const data = await adminService.getWishes(query);

  response.json(successResponse("Admin wishes fetched successfully", data));
}

export async function deleteAdminWish(request: AuthenticatedRequest, response: Response) {
  const wishId = getRequiredRouteParam(request.params.id, "id");
  const data = await adminService.deleteWish(wishId, request.authUser);

  response.json(successResponse("Spam wish deleted successfully", data));
}

export async function getAdminReports(request: AuthenticatedRequest, response: Response) {
  const query = adminReportsQuerySchema.parse(request.query);
  const data = await adminService.getReports(query);

  response.json(successResponse("Admin reports fetched successfully", data));
}

export async function getAdminGifts(request: AuthenticatedRequest, response: Response) {
  const query = adminGiftsQuerySchema.parse(request.query);
  const data = await adminService.getGifts(query);

  response.json(successResponse("Admin gift transactions fetched successfully", data));
}

export async function getAdminWithdrawalsList(
  request: AuthenticatedRequest,
  response: Response
) {
  const query = adminWithdrawalsQuerySchema.parse(request.query);
  const data = await adminService.getWithdrawals(query);

  response.json(successResponse("Admin withdrawal requests fetched successfully", data));
}

export async function getAdminMetrics(request: AuthenticatedRequest, response: Response) {
  const data = await adminService.getMetrics();

  response.json(successResponse("Admin metrics fetched successfully", data));
}
