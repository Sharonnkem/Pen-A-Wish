import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../types/auth.js";
import { successResponse } from "../utils/api-response.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import { eventService } from "../services/event.service.js";
import { eventSchema } from "../validators/event.validator.js";

export async function createEvent(request: AuthenticatedRequest, response: Response) {
  const payload = eventSchema.parse(request.body);
  const event = await eventService.createEvent(request.authUser, payload);

  response
    .status(201)
    .json(successResponse("Celebration created successfully", { event }));
}

export async function getMyEvents(request: AuthenticatedRequest, response: Response) {
  const events = await eventService.getMyEvents(request.authUser);

  response.json(successResponse("Celebrations fetched successfully", { events }));
}

export async function getEventById(request: AuthenticatedRequest, response: Response) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const event = await eventService.getEventForOwner(eventId, request.authUser);

  response.json(successResponse("Celebration fetched successfully", { event }));
}

export async function updateEvent(request: AuthenticatedRequest, response: Response) {
  const payload = eventSchema.parse(request.body);
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const event = await eventService.updateEvent(
    eventId,
    request.authUser,
    payload
  );

  response.json(successResponse("Celebration updated successfully", { event }));
}

export async function deleteEvent(request: AuthenticatedRequest, response: Response) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  await eventService.deleteEvent(eventId, request.authUser);

  response.json(successResponse("Celebration deleted successfully", {}));
}

export async function getPublicEventBySlug(request: Request, response: Response) {
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const data = await eventService.getPublicEventBySlug(slug);

  response.json(successResponse("Public celebration fetched successfully", data));
}

export async function getPublicWishWallBySlug(request: Request, response: Response) {
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const data = await eventService.getPublicWishWallBySlug(slug);

  response.json(successResponse("Public wish wall fetched successfully", data));
}
