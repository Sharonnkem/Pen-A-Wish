import { Router } from "express";

import {
  getEventGuestbook,
  getDashboardOverview,
  getEventWishes,
  hideEventWish
} from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard/overview", requireAuth, asyncHandler(getDashboardOverview));
dashboardRouter.get("/events/:id/wishes", requireAuth, asyncHandler(getEventWishes));
dashboardRouter.get("/events/:id/guestbook", requireAuth, asyncHandler(getEventGuestbook));
dashboardRouter.patch("/wishes/:id/hide", requireAuth, asyncHandler(hideEventWish));
