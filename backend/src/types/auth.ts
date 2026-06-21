import type { Request } from "express";

export type UserRole = "user" | "admin";

export type AuthUser = {
  email: string;
  id: string;
  name: string;
  role: UserRole;
};

export type JwtAccessPayload = {
  email: string;
  role: UserRole;
  sub: string;
};

export type PasswordResetPayload = {
  email: string;
  fingerprint: string;
  purpose: "password-reset";
  sub: string;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export type AuthenticatedRequest = Request & {
  authUser: AuthUser;
};
