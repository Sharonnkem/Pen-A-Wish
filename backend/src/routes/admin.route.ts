import { Router } from "express";

import {
  deleteAdminWish,
  getAdminEvents,
  getAdminGifts,
  getAdminMetrics,
  getAdminReports,
  getAdminUsers,
  getAdminWishes,
  getAdminWithdrawalsList
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const adminRouter = Router();

adminRouter.get("/admin/users", requireAuth, requireAdmin, asyncHandler(getAdminUsers));
adminRouter.get("/admin/events", requireAuth, requireAdmin, asyncHandler(getAdminEvents));
adminRouter.get("/admin/wishes", requireAuth, requireAdmin, asyncHandler(getAdminWishes));
adminRouter.delete(
  "/admin/wishes/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(deleteAdminWish)
);
adminRouter.get("/admin/reports", requireAuth, requireAdmin, asyncHandler(getAdminReports));
adminRouter.get("/admin/gifts", requireAuth, requireAdmin, asyncHandler(getAdminGifts));
adminRouter.get(
  "/admin/withdrawals",
  requireAuth,
  requireAdmin,
  asyncHandler(getAdminWithdrawalsList)
);
adminRouter.get("/admin/metrics", requireAuth, requireAdmin, asyncHandler(getAdminMetrics));
