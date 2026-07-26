import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider, dehydrate, hydrate } from "@tanstack/react-query";

import App from "./App";
import { ToastProvider } from "./components/common/Toast";
import { AuthProvider } from "./context/AuthContext";
import { ApiError } from "./services/api";
import { getStoredUser } from "./services/token-storage";
import "./index.css";

function getQueryCacheStorageKey() {
  const storedUser = getStoredUser();

  return storedUser?.id
    ? `pen-a-wish:query-cache:${storedUser.id}:v1`
    : "pen-a-wish:query-cache:anon:v1";
}

function loadPersistedQueryCache() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getQueryCacheStorageKey());

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry(failureCount, error) {
        if (error instanceof ApiError && error.status < 500) {
          return false;
        }

        return failureCount < 1;
      },
      gcTime: 24 * 60 * 60 * 1000,
      staleTime: 5 * 60 * 1000
    }
  }
});

const persistedQueryCache = loadPersistedQueryCache();

if (persistedQueryCache) {
  hydrate(queryClient, persistedQueryCache);
}

if (typeof window !== "undefined") {
  let persistTimer: number | null = null;

  const persistQueryCache = () => {
    if (persistTimer) {
      window.clearTimeout(persistTimer);
    }

    persistTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          getQueryCacheStorageKey(),
          JSON.stringify(dehydrate(queryClient))
        );
      } catch {
        // If storage is full or unavailable, we keep the app working without persistence.
      }
    }, 250);
  };

  queryClient.getQueryCache().subscribe(persistQueryCache);

  window.addEventListener("beforeunload", persistQueryCache);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
