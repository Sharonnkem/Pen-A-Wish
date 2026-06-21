import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "@/components/common/LoadingState";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
        <LoadingState className="w-full" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

