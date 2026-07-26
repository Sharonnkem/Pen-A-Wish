import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/cards/Card";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { useToast } from "../../components/common/Toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboard.service";
import { eventService } from "../../services/event.service";
import { formatNairaFromKobo } from "../../utils/currency";

export function DashboardHomePage() {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const eventsQuery = useQuery({
    queryFn: () => eventService.getMyEvents(),
    queryKey: ["my-events"]
  });
  const overviewQuery = useQuery({
    queryFn: () => dashboardService.getOverview(),
    queryKey: ["dashboard-overview"]
  });

  async function handleLogout() {
    await logout();
    showToast({
      title: "Logged out",
      description: "Your session was closed safely.",
      tone: "info"
    });
    navigate("/login", { replace: true });
  }

  return (
    <DashboardLayout
      title={`Welcome, ${user?.name ?? "there"}`}
      subtitle="Manage your celebrations, keep share links close, and prepare each event page before guests arrive."
      actions={<Button onClick={handleLogout}>Logout</Button>}
    >
      {eventsQuery.isError || overviewQuery.isError ? (
        <EmptyState
          title="Unable to load dashboard"
          description="We could not fetch your dashboard details right now. Please refresh and try again."
          actionLabel="Try again"
          onAction={() => {
            void eventsQuery.refetch();
            void overviewQuery.refetch();
          }}
        />
      ) : null}

      <div className="space-y-8">
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-3xl text-charcoal-900">Overview</h2>
              <p className="mt-1 text-sm text-charcoal-900/62">
                A quick read on your celebration activity, share readiness, and incoming support.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card
                className="h-full"
                title="Overview stats"
                description="Total celebrations you have created so far."
              >
                <p className="font-display text-4xl text-plum-800">
                  {overviewQuery.data?.data.stats.celebrationsCount ?? "—"}
                </p>
              </Card>
              <Card
                className="h-full"
                tone="polaroid"
                title="Public links"
                description="Celebration pages currently shareable through a public slug."
              >
                <p className="font-display text-4xl text-plum-800">
                  {overviewQuery.data?.data.stats.publicLinksCount ?? "—"}
                </p>
              </Card>
              <Card
                className="h-full"
                title="Wishes received"
                description="Wishes received across your celebration pages."
              >
                <p className="font-display text-4xl text-plum-800">
                  {overviewQuery.data?.data.stats.wishesReceivedCount ?? "—"}
                </p>
              </Card>
              <Card
                className="h-full"
                tone="plum"
                title="Gifts received"
                description="Successful gift transactions linked to your events."
              >
                <p className="font-display text-4xl text-white">
                  {overviewQuery.data?.data.stats.giftsReceivedCount ?? "—"}
                </p>
              </Card>
            </div>
          </section>

          <section className="grid gap-4">
            <Card
              tone="polaroid"
              title="Quick actions"
              description="The most common creator tasks, grouped into one polished control area."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Button onClick={() => navigate("/celebrations/new")}>Create celebration</Button>
                <Button variant="secondary" onClick={() => navigate("/wallet")}>
                  Open wallet
                </Button>
                <Button variant="ghost" onClick={() => navigate("/celebrations")}>
                  Review celebrations
                </Button>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-display text-3xl text-charcoal-900">Recent activity</h2>
              <p className="mt-1 text-sm text-charcoal-900/62">
                Keep an eye on the latest notes and gifts arriving across your celebration pages.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card
                title="Recent wishes"
                description="The latest heartfelt notes across all of your celebrations."
              >
                {overviewQuery.isLoading && !overviewQuery.data ? (
                  <LoadingState label="Loading recent wishes..." />
                ) : overviewQuery.data?.data.recentWishes.length ? (
                  <div className="space-y-3">
                    {overviewQuery.data.data.recentWishes.map((wish) => (
                      <div
                        key={wish.id}
                        className="rounded-[22px] border border-plum-700/10 bg-white/74 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal-900">{wish.senderName}</p>
                            <p className="mt-1 text-sm text-charcoal-900/56">
                              {wish.eventTitle}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-charcoal-900/72">
                          {wish.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent wishes"
                    description="Once visitors begin leaving wishes, the latest notes will appear here."
                  />
                )}
              </Card>

              <Card
                title="Recent gifts"
                description="A quick look at successful gift moments tied to your celebration pages."
              >
                {overviewQuery.isLoading && !overviewQuery.data ? (
                  <LoadingState label="Loading recent gifts..." />
                ) : overviewQuery.data?.data.recentGifts.length ? (
                  <div className="space-y-3">
                    {overviewQuery.data.data.recentGifts.map((gift) => (
                      <div
                        key={gift.id}
                        className="rounded-[22px] border border-plum-700/10 bg-white/74 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-charcoal-900">{gift.senderName}</p>
                            <p className="mt-1 text-sm text-charcoal-900/56">
                              {gift.eventTitle}
                            </p>
                          </div>
                          <p className="font-semibold text-plum-800">
                            {formatNairaFromKobo(gift.amountKobo)}
                          </p>
                        </div>
                        {gift.message ? (
                          <p className="mt-3 text-sm leading-7 text-charcoal-900/72">
                            {gift.message}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent gifts"
                    description="Successful celebration gifts will appear here as they come in."
                  />
                )}
              </Card>
            </div>
          </section>
      </div>

      {!eventsQuery.isLoading &&
      !eventsQuery.isError &&
      !eventsQuery.data?.data.events.length ? (
        <EmptyState
          title="No celebrations yet"
          description="Create your first celebration page to get a unique slug, public share link, and dashboard tracking for wishes and gifts."
          actionLabel="Create celebration"
          onAction={() => navigate("/celebrations/new")}
        />
      ) : null}
    </DashboardLayout>
  );
}
