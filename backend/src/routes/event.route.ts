import { Router } from "express";

import {
  initializeGift,
} from "../controllers/gift.controller.js";
import {
  deleteEventGuestbookEntry,
  hideEventGuestbookEntry,
  submitGuestbookEntry
} from "../controllers/guestbook.controller.js";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getMyEvents,
  getPublicEventBySlug,
  getPublicWishWallBySlug,
  updateEvent
} from "../controllers/event.controller.js";
import { exportWishWall } from "../controllers/wish-wall-export.controller.js";
import {
  getWishWallSettings,
  updateWishWallSettings
} from "../controllers/wish-wall.controller.js";
import {
  getEventReactions,
  getEventShareImage,
  submitEventReaction,
  submitWish,
  submitWishReaction
} from "../controllers/public-event.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const eventRouter = Router();

eventRouter.post("/events", requireAuth, asyncHandler(createEvent));
eventRouter.get("/events/my-events", requireAuth, asyncHandler(getMyEvents));
eventRouter.get("/events/:id", requireAuth, asyncHandler(getEventById));
eventRouter.patch("/events/:id", requireAuth, asyncHandler(updateEvent));
eventRouter.delete("/events/:id", requireAuth, asyncHandler(deleteEvent));
eventRouter.get("/events/:id/wall-settings", requireAuth, asyncHandler(getWishWallSettings));
eventRouter.get("/events/:id/wall-export", requireAuth, asyncHandler(exportWishWall));
eventRouter.patch(
  "/events/:id/wall-settings",
  requireAuth,
  asyncHandler(updateWishWallSettings)
);
eventRouter.get("/public/events/:slug", asyncHandler(getPublicEventBySlug));
eventRouter.get("/public/events/:slug/wall", asyncHandler(getPublicWishWallBySlug));
eventRouter.get("/public/events/:slug/share-image.svg", asyncHandler(getEventShareImage));
eventRouter.post("/public/events/:slug/wishes", asyncHandler(submitWish));
eventRouter.post("/public/events/:slug/guestbook", asyncHandler(submitGuestbookEntry));
eventRouter.post("/public/events/:slug/gifts/initialize", asyncHandler(initializeGift));
eventRouter.post("/public/events/:slug/reactions", asyncHandler(submitEventReaction));
eventRouter.post("/public/wishes/:wishId/reactions", asyncHandler(submitWishReaction));
eventRouter.get("/public/events/:slug/reactions", asyncHandler(getEventReactions));
eventRouter.patch("/guestbook/:id/hide", requireAuth, asyncHandler(hideEventGuestbookEntry));
eventRouter.delete("/guestbook/:id", requireAuth, asyncHandler(deleteEventGuestbookEntry));
