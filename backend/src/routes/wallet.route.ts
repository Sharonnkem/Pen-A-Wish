import { Router } from "express";

import { requireAdmin } from "../middleware/admin.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  approveAdminWithdrawal,
  createWithdrawalRequest,
  getAdminWithdrawals,
  getWallet,
  getWalletTransactions,
  rejectAdminWithdrawal
} from "../controllers/wallet.controller.js";

export const walletRouter = Router();

walletRouter.get("/wallet", requireAuth, asyncHandler(getWallet));
walletRouter.get("/wallet/transactions", requireAuth, asyncHandler(getWalletTransactions));
walletRouter.post("/wallet/withdrawals", requireAuth, asyncHandler(createWithdrawalRequest));

walletRouter.get(
  "/admin/withdrawals",
  requireAuth,
  requireAdmin,
  asyncHandler(getAdminWithdrawals)
);
walletRouter.patch(
  "/admin/withdrawals/:id/approve",
  requireAuth,
  requireAdmin,
  asyncHandler(approveAdminWithdrawal)
);
walletRouter.patch(
  "/admin/withdrawals/:id/reject",
  requireAuth,
  requireAdmin,
  asyncHandler(rejectAdminWithdrawal)
);
