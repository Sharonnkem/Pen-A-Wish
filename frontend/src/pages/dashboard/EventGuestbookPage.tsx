import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { useToast } from "@/components/common/Toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { dashboardService } from "@/services/dashboard.service";

export function EventGuestbookPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const guestbookQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => dashboardService.getEventGuestbook(id),
    queryKey: ["event-guestbook", id]
  });

  const hideMutation = useMutation({
    mutationFn: (entryId: string) => dashboardService.hideGuestbookEntry(entryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["event-guestbook", id] });
      showToast({
        title: "Memory hidden",
        description: "This guestbook entry has been removed from the public memory book.",
        tone: "success"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => dashboardService.deleteGuestbookEntry(entryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["event-guestbook", id] });
      showToast({
        title: "Memory deleted",
        description: "The guestbook entry has been permanently removed.",
        tone: "success"
      });
    }
  });

  return (
    <DashboardLayout
      title={guestbookQuery.data?.data.event.title ?? "Event guestbook"}
      subtitle="Review longer memories and keep the public memory book warm, polished, and safe."
      actions={
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
      }
    >
      {guestbookQuery.isLoading ? (
        <LoadingState label="Opening the latest guestbook memories..." />
      ) : null}

      {guestbookQuery.isError ? (
        <EmptyState
          title="Unable to load guestbook"
          description="We could not fetch the guestbook entries for this celebration right now."
          actionLabel="Try again"
          onAction={() => void guestbookQuery.refetch()}
        />
      ) : null}

      {!guestbookQuery.isLoading &&
      !guestbookQuery.isError &&
      !guestbookQuery.data?.data.entries.length ? (
        <EmptyState
          title="No guestbook memories yet"
          description="Long-form memories from your guests will appear here once they start writing."
        />
      ) : null}

      {!guestbookQuery.isLoading &&
      !guestbookQuery.isError &&
      guestbookQuery.data?.data.entries.length ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-3xl text-charcoal-900">Guestbook entries</h2>
            <p className="mt-1 text-sm text-charcoal-900/62">
              Longer memories stay grouped, readable, and easy to moderate without the page feeling crowded.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {guestbookQuery.data.data.entries.map((entry) => (
              <Card
                key={entry.id}
                tone={entry.isHidden ? "paper" : "polaroid"}
                eyebrow={entry.isHidden ? "Hidden memory" : "Guestbook memory"}
                title={entry.senderName}
                description={entry.message}
                footer={
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={entry.isHidden || hideMutation.isPending}
                      onClick={() => hideMutation.mutate(entry.id)}
                    >
                      {entry.isHidden ? "Already hidden" : "Hide entry"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(entry.id)}
                    >
                      Delete entry
                    </Button>
                  </div>
                }
              >
                <div className="space-y-3 text-sm text-charcoal-900/62">
                  <div className="rounded-[20px] bg-white/62 p-4">
                    <p>{new Date(entry.createdAt).toLocaleString()}</p>
                    {entry.senderEmail ? <p className="mt-2">{entry.senderEmail}</p> : null}
                  </div>
                  <div className="rounded-[20px] bg-cream-50/88 p-4 leading-7 text-charcoal-900/74">
                    This entry appears in the memory-book presentation unless it is hidden.
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </DashboardLayout>
  );
}
