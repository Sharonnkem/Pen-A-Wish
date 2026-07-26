import type { Request, Response } from "express";

import { env } from "../config/env.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../utils/cookies.js";
import { successResponse } from "../utils/api-response.js";
import { authService } from "../services/auth.service.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema
} from "../validators/auth.validator.js";

export async function register(request: Request, response: Response) {
  const payload = registerSchema.parse(request.body);
  const result = await authService.register(payload);

  setRefreshTokenCookie(response, result.refreshToken);

  response.status(201).json(
    successResponse("Account created successfully", {
      accessToken: result.accessToken,
      user: result.user
    })
  );
}

export async function login(request: Request, response: Response) {
  const payload = loginSchema.parse(request.body);
  const result = await authService.login(payload);

  setRefreshTokenCookie(response, result.refreshToken);

  response.json(
    successResponse("Login successful", {
      accessToken: result.accessToken,
      user: result.user
    })
  );
}

export async function logout(request: AuthenticatedRequest, response: Response) {
  const refreshToken = request.cookies?.[env.authCookieName] as string | undefined;

  await authService.logout(refreshToken);
  clearRefreshTokenCookie(response);

  response.json(successResponse("Logout successful", {}));
}

export async function refreshToken(request: Request, response: Response) {
  const refreshCookie = request.cookies?.[env.authCookieName] as string | undefined;
  const result = await authService.refreshAccessToken(refreshCookie);

  setRefreshTokenCookie(response, result.refreshToken);

  response.json(
    successResponse("Access token refreshed successfully", {
      accessToken: result.accessToken,
      user: result.user
    })
  );
}

export async function forgotPassword(request: Request, response: Response) {
  const payload = forgotPasswordSchema.parse(request.body);

  await authService.forgotPassword(payload.email);

  response.json(
    successResponse(
      "If that email exists, a password reset link has been sent",
      {}
    )
  );
}

export async function resetPassword(request: Request, response: Response) {
  const payload = resetPasswordSchema.parse(request.body);

  await authService.resetPassword(payload);
  clearRefreshTokenCookie(response);

  response.json(successResponse("Password reset successful", {}));
}

export async function updateProfile(
  request: AuthenticatedRequest,
  response: Response
) {
  const payload = updateProfileSchema.parse(request.body);
  const data = await authService.updateProfile(request.authUser, payload);

  response.json(successResponse("Profile updated successfully", data));
}

export async function deleteAccount(
  request: AuthenticatedRequest,
  response: Response
) {
  await authService.deleteAccount(request.authUser);
  clearRefreshTokenCookie(response);

  response.json(successResponse("Account deleted successfully", {}));
}
