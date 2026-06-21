import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminService } from "@/services/admin.service";
import { formatNairaFromKobo } from "@/utils/currency";

const adminDestinations = [
  {
    description: "Review platform members, account roles, celebration volume, and gift totals.",
    title: "Users",
    to: "/admin/users"
  },
  {
    description: "Browse celebration pages, creators, event types, and engagement totals.",
    title: "Celebrations",
    to: "/admin/celebrations"
  },
  {
    description: "Moderate public wishes and remove clear spam before it reaches keepsake exports.",
    title: "Wishes",
    to: "/admin/wishes"
  },
  {
    description: "Track reported content, open moderation work, and unresolved concerns.",
    title: "Reports",
    to: "/admin/reports"
  },
  {
    description: "Inspect successful and pending gift transactions across the platform.",
    title: "Gift transactions",
    to: "/admin/gifts"
  },
  {
    description: "Approve or reject withdrawal requests with a logged decision trail.",
    title: "Withdrawals",
    to: "/admin/withdrawals"
  }
] as const;

export function AdminHomePage() {
  const navigate = useNavigate();
  const metricsQuery = useQuery({
    queryFn: () => adminService.getMetrics(),
    queryKey: ["admin-metrics"]
  });

  const metrics = metricsQuery.data?.data.metrics;

  return (
    <AdminLayout
      title="Platform overview"
      subtitle="Keep the celebration platform healthy with one premium control space for moderation, money movement, and high-level visibility."
    >
      {metricsQuery.isLoading ? <LoadingState label="Loading platform metrics..." /> : null}

      {metricsQuery.isError ? (
        <EmptyState
          title="Unable to load admin overview"
          description="We could not fetch platform metrics right now."
          actionLabel="Try again"
          onAction={() => void metricsQuery.refetch()}
        />
      ) : null}

      {metrics ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card title="Platform users" description="Registered accounts on Pen A Wish.">
              <p className="font-display text-4xl text-plum-800">{metrics.totalUsers}</p>
            </Card>
            <Card tone="polaroid" title="Celebrations" description="Total created celebration pages.">
              <p className="font-display text-4xl text-plum-800">
                {metrics.totalCelebrations}
              </p>
            </Card>
            <Card title="Wishes" description="Stored wishes across public celebrations.">
              <p className="font-display text-4xl text-plum-800">{metrics.totalWishes}</p>
            </Card>
            <Card tone="plum" title="Gift value" description="Successful gift value on the platform.">
              <p className="font-display text-3xl text-white">
                {formatNairaFromKobo(metrics.successfulGiftValueKobo)}
              </p>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card
              title="Moderation pulse"
              description="The admin room should show where attention is needed next without feeling cold or mechanical."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] bg-cream-50 p-4">
                  <p className="text-sm text-charcoal-900/58">Open reports</p>
                  <p className="mt-3 font-display text-3xl text-plum-800">
                    {metrics.openReportsCount}
                  </p>
                </div>
                <div className="rounded-[22px] bg-cream-50 p-4">
                  <p className="text-sm text-charcoal-900/58">Pending withdrawals</p>
                  <p className="mt-3 font-display text-3xl text-plum-800">
                    {metrics.pendingWithdrawalsCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              tone="polaroid"
              title="Platform flow"
              description="A quick snapshot of warm celebration activity and sensitive financial operations."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-plum-700/10 bg-white/74 p-4">
                  <p className="text-sm text-charcoal-900/58">Successful gifts</p>
                  <p className="mt-3 font-display text-3xl text-plum-800">
                    {metrics.totalGifts}
                  </p>
                </div>
                <div className="rounded-[22px] border border-plum-700/10 bg-white/74 p-4">
                  <p className="text-sm text-charcoal-900/58">Records in focus</p>
                  <p className="mt-3 font-display text-3xl text-plum-800">
                    {metrics.openReportsCount + metrics.pendingWithdrawalsCount}
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="font-display text-3xl text-charcoal-900">Admin destinations</h2>
              <p className="mt-1 text-sm text-charcoal-900/62">
                Jump into the exact review queue or data surface you need.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {adminDestinations.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="rounded-[28px] border border-white/70 bg-white/84 p-6 text-left shadow-card transition hover:-translate-y-1"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-plum-700">
                    Admin area
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-charcoal-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal-900/70">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </AdminLayout>
  );
}
