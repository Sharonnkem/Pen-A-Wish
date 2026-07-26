import { appConfig } from "../config/app";
import {
  getAccessToken,
  setAccessToken,
  setStoredUser
} from "./token-storage";
import type { AuthResponse } from "../types/auth";

export class ApiError extends Error {
  public readonly errors: string[];
  public readonly status: number;

  constructor(message: string, status: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

let refreshSessionPromise: Promise<AuthResponse["data"] | null> | null = null;

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, ...requestInit } = options;
  const headers = new Headers(options.headers);
  const accessToken = getAccessToken();
  const isFormData = body instanceof FormData;
  const requestBody =
    body === undefined
      ? undefined
      : isFormData
        ? body
        : JSON.stringify(body);

  if (body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    ...requestInit,
    credentials: "include",
    headers,
    body: requestBody
  });

  if (response.status === 401 && !path.startsWith("/auth/")) {
    const refreshed = await refreshSession();

    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed.accessToken}`);

      const retryResponse = await fetch(`${appConfig.apiBaseUrl}${path}`, {
        ...requestInit,
        credentials: "include",
        headers,
        body: requestBody
      });

      const retryPayload = (await retryResponse.json().catch(() => null)) as
        | { errors?: string[]; message?: string }
        | null;

      if (!retryResponse.ok) {
        throw new ApiError(
          retryPayload?.message ?? "Request failed",
          retryResponse.status,
          retryPayload?.errors ?? []
        );
      }

      return retryPayload as T;
    }
  }

  const payload = (await response.json().catch(() => null)) as
    | { errors?: string[]; message?: string }
    | null;

  if (!response.ok) {
    throw new ApiError(
      payload?.message ?? "Request failed",
      response.status,
      payload?.errors ?? []
    );
  }

  return payload as T;
}

async function refreshSession(): Promise<AuthResponse["data"] | null> {
  if (refreshSessionPromise) {
    return refreshSessionPromise;
  }

  refreshSessionPromise = (async () => {
    const response = await fetch(`${appConfig.apiBaseUrl}/auth/refresh-token`, {
      credentials: "include",
      method: "POST"
    });

    const payload = (await response.json().catch(() => null)) as AuthResponse | null;

    if (!response.ok || !payload?.data) {
      return null;
    }

    setAccessToken(payload.data.accessToken);
    setStoredUser(payload.data.user);

    return payload.data;
  })();

  try {
    return await refreshSessionPromise;
  } finally {
    refreshSessionPromise = null;
  }
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "GET"
    });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body
    });
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body
    });
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, {
      ...options,
      method: "DELETE"
    });
  }
};
