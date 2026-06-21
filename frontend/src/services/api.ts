import { appConfig } from "@/config/app";
import { getAccessToken } from "@/services/token-storage";

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
