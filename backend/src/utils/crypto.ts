import crypto from "node:crypto";

export function createRandomToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

