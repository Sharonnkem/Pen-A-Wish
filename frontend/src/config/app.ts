const defaultApiBaseUrl = "/api";

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME ?? "Pen A Wish"
} as const;
