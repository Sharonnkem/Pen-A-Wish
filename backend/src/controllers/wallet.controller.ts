import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/auth.js";
import { successResponse } from "../utils/api-response.js";
import { getRequiredRouteParam } from "../utils/route-param.js";
import {
  adminWithdrawalActionSchema,
  adminWithdrawalRejectSchema,
  withdrawalListQuerySchema,
  withdrawalRequestSchema
} from "../validators/wallet.validator.js";
import { walletService } from "../services/wallet.service.js";

export async function getWallet(
  request: AuthenticatedRequest,
  response: Response
) {
  const data = await walletService.getWallet(request.authUser);

  response.json(successResponse("Wallet fetched successfully", data));
}

export async function getWalletTransactions(
  request: AuthenticatedRequest,
  response: Response
) {
  const data = await walletService.getWalletTransactions(request.authUser);

  response.json(successResponse("Wallet transactions fetched successfully", data));
}

export async function createWithdrawalRequest(
  request: AuthenticatedRequest,
  response: Response
) {
  const payload = withdrawalRequestSchema.parse(request.body);
  const data = await walletService.requestWithdrawal(request.authUser, payload);

  response.status(201).json(successResponse("Withdrawal request submitted successfully", data));
}

export async function getAdminWithdrawals(
  request: AuthenticatedRequest,
  response: Response
) {
  const query = withdrawalListQuerySchema.parse(request.query);
  const data = await walletService.getAdminWithdrawals(query);

  response.json(successResponse("Withdrawal requests fetched successfully", data));
}

export async function approveAdminWithdrawal(
  request: AuthenticatedRequest,
  response: Response
) {
  const payload = adminWithdrawalActionSchema.parse(request.body ?? {});
  const withdrawalId = getRequiredRouteParam(request.params.id, "id");
  const data = await walletService.approveWithdrawal(
    withdrawalId,
    request.authUser,
    payload
  );

  response.json(successResponse("Withdrawal approved successfully", data));
}

export async function rejectAdminWithdrawal(
  request: AuthenticatedRequest,
  response: Response
) {
  const payload = adminWithdrawalRejectSchema.parse(request.body);
  const withdrawalId = getRequiredRouteParam(request.params.id, "id");
  const data = await walletService.rejectWithdrawal(
    withdrawalId,
    request.authUser,
    payload
  );

  response.json(successResponse("Withdrawal rejected successfully", data));
}
