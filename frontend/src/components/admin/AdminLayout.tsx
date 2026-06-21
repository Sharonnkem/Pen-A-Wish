import type { PropsWithChildren, ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

type AdminLayoutProps = PropsWithChildren<{
  actions?: ReactNode;
  subtitle: string;
  title: string;
}>;

const navItems = [
  { label: "Overview", to: "/admin" },
  { label: "Users", to: "/admin/users" },
  { label: "Celebrations", to: "/admin/celebrations" },
  { label: "Wishes", to: "/admin/wishes" },
  { label: "Reports", to: "/admin/reports" },
  { label: "Gifts", to: "/admin/gifts" },
  { label: "Withdrawals", to: "/admin/withdrawals" }
];

export function AdminLayout({
  actions,
  children,
  subtitle,
  title
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-paper px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[82rem] gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(76,44,67,0.98)_0%,rgba(53,27,45,0.98)_100%)] p-5 text-white shadow-card sm:p-6">
            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/8 p-5">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold-400/15 blur-3xl" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush-100">
                Platform Stewardship
              </p>
              <h2 className="mt-3 font-display text-[2rem] leading-tight">
                Pen A Wish admin room
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/74">
                A warm moderation studio for protecting celebrations, reviewing money
                movement, and keeping the platform trustworthy.
              </p>
            </div>

            <nav className="mt-5 grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-[20px] px-4 py-3 text-sm transition",
                      isActive
                        ? "bg-white text-plum-800 shadow-[0_14px_30px_rgba(17,13,18,0.18)]"
                        : "text-white/84 hover:bg-white/10 hover:text-white"
                    )
                  }
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">{"->"}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-blush-100/84">
                Signed in
              </p>
              <p className="mt-2 font-semibold text-white">{user?.name}</p>
              <p className="mt-1 text-sm text-white/72">{user?.email}</p>

              <div className="mt-4 grid gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  className="bg-white/90"
                  onClick={() => navigate("/dashboard")}
                >
                  User dashboard
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="overflow-hidden rounded-[34px] border border-white/70 bg-white/84 p-6 shadow-card sm:p-7">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
                  Admin Panel
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-charcoal-900 sm:text-[2.75rem]">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-7 text-charcoal-900/72 sm:text-base">
                  {subtitle}
                </p>
              </div>
              {actions ? (
                <div className="flex flex-wrap gap-3 rounded-[24px] bg-cream-50/72 p-2">
                  {actions}
                </div>
              ) : null}
            </div>
          </header>
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
