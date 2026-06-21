import multer from "multer";
import { Router } from "express";

import { uploadImage } from "../controllers/upload.controller.js";
import { proxyImage } from "../controllers/proxy.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  storage: multer.memoryStorage()
});

export const uploadRouter = Router();

uploadRouter.get("/proxy-image", asyncHandler(proxyImage));

uploadRouter.post(
  "/image",
  requireAuth,
  upload.single("image"),
  asyncHandler(uploadImage)
);
