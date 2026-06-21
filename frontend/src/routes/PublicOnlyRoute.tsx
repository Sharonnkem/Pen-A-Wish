import { Navigate, Outlet } from "react-router-dom";

import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "../context/AuthContext";

export function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
        <LoadingState className="w-full" />
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
}

