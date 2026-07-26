import type { AuthUser } from "../types/auth";

const accessTokenKey = "pen_a_wish_access_token";
const userKey = "pen_a_wish_auth_user";

let accessToken =
  typeof window !== "undefined" ? window.localStorage.getItem(accessTokenKey) : null;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof atob === "function") {
    return atob(padded);
  }

  return "";
}

export function getAccessTokenExpiryMs(token: string | null) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as { exp?: number };

    if (!payload.exp) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;

  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(accessTokenKey, token);
  } else {
    window.localStorage.removeItem(accessTokenKey);
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(userKey);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (user) {
    window.localStorage.setItem(userKey, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(userKey);
  }
}

export function clearStoredSession() {
  setAccessToken(null);
  setStoredUser(null);
}
