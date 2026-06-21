import { useState, type PropsWithChildren, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

type DashboardLayoutProps = PropsWithChildren<{
  actions?: ReactNode;
  className?: string;
  subtitle: string;
  title: string;
}>;

const navLinks = [
  { label: "Dashboard overview", to: "/dashboard" },
  { label: "My celebrations", to: "/celebrations" },
  { label: "Create celebration", to: "/celebrations/new" },
  { label: "Wallet", to: "/wallet" },
  { label: "Profile & settings", to: "/settings" }
] as const;

export function DashboardLayout({
  actions,
  children,
  className,
  subtitle,
  title
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className={cn("min-h-screen bg-paper px-4 py-4 sm:px-6 lg:px-8", className)}>
      {isSidebarOpen ? (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-charcoal-900/40 xl:hidden"
          type="button"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}
      <Button
        aria-label="Open sidebar"
        className="fixed left-4 top-4 z-30 shadow-[0_14px_30px_rgba(17,13,18,0.16)] xl:hidden"
        variant="secondary"
        size="sm"
        onClick={() => setIsSidebarOpen(true)}
      >
        Menu
      </Button>
      <div className="mx-auto grid max-w-[82rem] gap-6 pt-16 xl:grid-cols-[18.5rem_minmax(0,1fr)] xl:pt-0">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[88vw] max-w-[20rem] overflow-hidden transition-transform duration-300 ease-out xl:sticky xl:top-4 xl:z-auto xl:block xl:h-[calc(100vh-2rem)] xl:w-auto xl:max-w-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
          )}
        >
          <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-[32px] border border-white/70 bg-plum-800 p-5 text-white shadow-card sm:p-6">
            <div className="mb-4 flex items-center justify-between xl:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush-100">
                Navigation
              </p>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/12 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                Close
              </Button>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush-100">
                Celebration Control Room
              </p>
              <h2 className="mt-3 font-display text-[2rem] leading-tight">
                Pen A Wish dashboard
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/75">
                A warm operational space for managing pages, gifts, and heartfelt
                messages.
              </p>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-blush-100/80">
                Signed in
              </p>
              <p className="mt-2 font-semibold text-white">{user?.name ?? "Creator"}</p>
              <p className="mt-1 text-sm text-white/72">{user?.email}</p>
            </div>

            <nav className="mt-5 grid gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/dashboard"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-[20px] px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-white text-plum-800 shadow-[0_14px_30px_rgba(17,13,18,0.18)]"
                        : "text-white/84 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true">{"->"}</span>
                </NavLink>
              ))}

              {user?.role === "admin" ? (
                <div className="space-y-2">
                  <p className="px-4 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-blush-100/78">
                    Admin
                  </p>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-[20px] px-4 py-3 text-sm transition",
                        isActive
                          ? "bg-white text-plum-800 shadow-[0_14px_30px_rgba(17,13,18,0.18)]"
                          : "text-white/84 hover:bg-white/10 hover:text-white"
                      )
                    }
                  >
                    <span>Admin panel</span>
                    <span aria-hidden="true">{"->"}</span>
                  </NavLink>
                </div>
              ) : null}
            </nav>
            <div className="mt-5 grid gap-3">
              {user?.role === "admin" ? (
                <Button
                  variant="ghost"
                  fullWidth
                  className="text-white hover:bg-white/12 hover:text-white"
                  onClick={() => navigate("/admin")}
                >
                  Open admin panel
                </Button>
              ) : null}
              <Button
                variant="ghost"
                fullWidth
                className="text-white hover:bg-white/12 hover:text-white"
                onClick={() => void handleLogout()}
              >
                Logout
              </Button>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="rounded-[32px] border border-white/70 bg-white/84 p-6 shadow-card sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-display text-4xl leading-tight text-charcoal-900 sm:text-[2.75rem]">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-7 text-charcoal-900/72 sm:text-base">
                  {subtitle}
                </p>
              </div>
              {actions ? <div className="flex shrink-0 justify-start sm:justify-end">{actions}</div> : null}
            </div>
          </header>
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
