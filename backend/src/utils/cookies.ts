import type { Response } from "express";

import { env } from "../config/env.js";

function isLocalOrigin(origin: string) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function getCookieSettings(maxAge: number) {
  const isCrossOriginFrontend = env.frontendOrigins.some((origin) => !isLocalOrigin(origin));
  const shouldUseCrossSiteCookies = env.nodeEnv === "production" || isCrossOriginFrontend;
  const sameSite: "none" | "lax" = shouldUseCrossSiteCookies ? "none" : "lax";
  const secure = shouldUseCrossSiteCookies;

  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite,
    secure
  };
}

export function setRefreshTokenCookie(response: Response, refreshToken: string) {
  const maxAge = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;

  response.cookie(env.authCookieName, refreshToken, getCookieSettings(maxAge));
}

export function clearRefreshTokenCookie(response: Response) {
  response.clearCookie(env.authCookieName, getCookieSettings(0));
}
