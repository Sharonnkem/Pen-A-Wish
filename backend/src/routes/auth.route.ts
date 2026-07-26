import { Router } from "express";

import {
  deleteAccount,
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateProfile
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/logout", requireAuth, asyncHandler(logout));
authRouter.post("/refresh-token", asyncHandler(refreshToken));
authRouter.post("/forgot-password", asyncHandler(forgotPassword));
authRouter.post("/reset-password", asyncHandler(resetPassword));
authRouter.patch("/me", requireAuth, asyncHandler(updateProfile));
authRouter.delete("/me", requireAuth, asyncHandler(deleteAccount));
