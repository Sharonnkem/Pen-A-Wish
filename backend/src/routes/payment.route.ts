import { Router } from "express";

import { verifyPaystackPayment } from "../controllers/gift.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const paymentRouter = Router();

paymentRouter.post("/payments/paystack/verify", asyncHandler(verifyPaystackPayment));
