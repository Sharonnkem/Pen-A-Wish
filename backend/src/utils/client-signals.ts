import crypto from "node:crypto";
import type { Request } from "express";

export function getClientIpHash(request: Request) {
  const forwarded = request.headers["x-forwarded-for"];
  const rawIp =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : request.ip ?? request.socket.remoteAddress ?? "";

  if (!rawIp) {
    return null;
  }

  return crypto.createHash("sha256").update(rawIp).digest("hex");
}

