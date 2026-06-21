import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type {
  AuthUser,
  JwtAccessPayload,
  PasswordResetPayload
} from "../types/auth.js";
import { hashToken } from "./crypto.js";

export function createAccessToken(user: AuthUser) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role
    },
    env.jwtAccessSecret,
    {
      expiresIn: `${env.accessTokenTtlMinutes}m`,
      subject: user.id
    }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as JwtAccessPayload;
}

export function createPasswordResetToken(user: {
  email: string;
  id: string;
  passwordHash: string;
}) {
  return jwt.sign(
    {
      email: user.email,
      fingerprint: hashToken(user.passwordHash),
      purpose: "password-reset"
    },
    env.jwtRefreshSecret,
    {
      expiresIn: `${env.resetPasswordTtlMinutes}m`,
      subject: user.id
    }
  );
}

export function verifyPasswordResetToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as PasswordResetPayload;
}

