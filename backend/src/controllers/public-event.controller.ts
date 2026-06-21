import type { Request, Response } from "express";

import { publicEventService } from "../services/public-event.service.js";
import { successResponse } from "../utils/api-response.js";
import { getClientIpHash } from "../utils/client-signals.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import {
  publicReactionSchema,
  publicWishSchema
} from "../validators/public-event.validator.js";

export async function submitWish(request: Request, response: Response) {
  const payload = publicWishSchema.parse(request.body);
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const wish = await publicEventService.submitWish(slug, {
    ...payload,
    ipHash: getClientIpHash(request)
  });

  response.status(201).json(
    successResponse("Wish submitted successfully", {
      wish: {
        createdAt: wish.created_at,
        id: wish.id,
        message: wish.message,
        senderName: wish.sender_name
      }
    })
  );
}

export async function submitEventReaction(request: Request, response: Response) {
  const payload = publicReactionSchema.parse(request.body);
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const counts = await publicEventService.submitEventReaction(slug, {
    ipHash: getClientIpHash(request),
    reactionType: payload.reactionType,
    visitorFingerprint: payload.visitorFingerprint
  });

  response.status(201).json(
    successResponse("Reaction submitted successfully", {
      counts
    })
  );
}

export async function submitWishReaction(request: Request, response: Response) {
  const payload = publicReactionSchema.parse(request.body);
  const wishId = getRequiredRouteParam(request.params.wishId, "wishId");
  const counts = await publicEventService.submitWishReaction(wishId, {
    ipHash: getClientIpHash(request),
    reactionType: payload.reactionType,
    visitorFingerprint: payload.visitorFingerprint
  });

  response.status(201).json(
    successResponse("Wish reaction submitted successfully", {
      counts
    })
  );
}

export async function getEventReactions(request: Request, response: Response) {
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const counts = await publicEventService.getEventReactionCounts(slug);

  response.json(successResponse("Reactions fetched successfully", { counts }));
}
