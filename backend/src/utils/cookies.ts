import type { Response } from "express";

import { env } from "../config/env.js";

function getCookieSettings(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: env.nodeEnv === "production"
  };
}

export function setRefreshTokenCookie(response: Response, refreshToken: string) {
  const maxAge = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;

  response.cookie(env.authCookieName, refreshToken, getCookieSettings(maxAge));
}

export function clearRefreshTokenCookie(response: Response) {
  response.clearCookie(env.authCookieName, getCookieSettings(0));
}

