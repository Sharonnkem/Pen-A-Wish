import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "@/App";
import { ToastProvider } from "@/components/common/Toast";
import { AuthProvider } from "@/context/AuthContext";
import "@/index.css";

const queryClient = new QueryClient();

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
