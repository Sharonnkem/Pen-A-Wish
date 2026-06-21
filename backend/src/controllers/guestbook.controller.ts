import type { Request, Response } from "express";

import { guestbookService } from "../services/guestbook.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { successResponse } from "../utils/api-response.js";
import { getClientIpHash } from "../utils/client-signals.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import { publicGuestbookSchema } from "../validators/public-event.validator.js";

export async function submitGuestbookEntry(
  request: Request,
  response: Response
) {
  const payload = publicGuestbookSchema.parse(request.body);
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const entry = await guestbookService.submitEntry(slug, {
    ...payload,
    ipHash: getClientIpHash(request)
  });

  response.status(201).json(
    successResponse("Guestbook entry submitted successfully", {
      entry: {
        createdAt: entry.created_at,
        id: entry.id,
        message: entry.message,
        senderName: entry.sender_name
      }
    })
  );
}

export async function getEventGuestbookEntries(
  request: AuthenticatedRequest,
  response: Response
) {
  const eventId = getRequiredRouteParam(request.params.id, "id");
  const data = await guestbookService.getEntriesForOwner(
    eventId,
    request.authUser
  );

  response.json(successResponse("Guestbook entries fetched successfully", data));
}

export async function hideEventGuestbookEntry(
  request: AuthenticatedRequest,
  response: Response
) {
  const entryId = getRequiredRouteParam(request.params.id, "id");
  const entry = await guestbookService.hideEntry(entryId, request.authUser);

  response.json(
    successResponse("Guestbook entry hidden successfully", {
      entry: entry
        ? {
            createdAt: entry.created_at,
            id: entry.id,
            isHidden: entry.is_hidden,
            message: entry.message,
            senderEmail: entry.sender_email,
            senderName: entry.sender_name
          }
        : null
    })
  );
}

export async function deleteEventGuestbookEntry(
  request: AuthenticatedRequest,
  response: Response
) {
  const entryId = getRequiredRouteParam(request.params.id, "id");
  await guestbookService.deleteEntry(entryId, request.authUser);

  response.json(successResponse("Guestbook entry deleted successfully", {}));
}
