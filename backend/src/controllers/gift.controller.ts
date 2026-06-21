import type { Request, Response } from "express";

import { giftService } from "../services/gift.service.js";
import { successResponse } from "../utils/api-response.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import { giftInitializeSchema, paystackVerifySchema } from "../validators/gift.validator.js";

export async function initializeGift(request: Request, response: Response) {
  const payload = giftInitializeSchema.parse(request.body);
  const slug = getRequiredRouteParam(request.params.slug, "slug");
  const data = await giftService.initializeGift(slug, payload);

  response.status(201).json(successResponse("Gift payment initialized successfully", data));
}

export async function verifyPaystackPayment(request: Request, response: Response) {
  const payload = paystackVerifySchema.parse(request.body);
  const data = await giftService.verifyPaystackPayment(payload.reference);

  response.json(successResponse("Payment verified successfully", data));
}
