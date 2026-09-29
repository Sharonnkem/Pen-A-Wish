const defaultApiBaseUrl = "/api";

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  shareBaseUrl: import.meta.env.VITE_SHARE_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME ?? "Wishmarsh"
} as const;
