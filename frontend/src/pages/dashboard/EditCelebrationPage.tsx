import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "../../components/cards/Card";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { useToast } from "../../components/common/Toast";
import { CelebrationForm } from "../../components/forms/CelebrationForm";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { eventService } from "../../services/event.service";
import type { CreateEventInput } from "../../types/event";

export function EditCelebrationPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const eventQuery = useQuery({
    queryFn: () => eventService.getEventById(id),
    queryKey: ["event", id],
    enabled: Boolean(id)
  });

  const updateMutation = useMutation({
    mutationFn: (input: CreateEventInput) => eventService.updateEvent(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-events"] });
      await queryClient.invalidateQueries({ queryKey: ["event", id] });
      navigate(`/celebrations/${id}`);
    }
  });

  if (eventQuery.isLoading) {
    return (
      <DashboardLayout
        title="Edit celebration"
        subtitle="Loading your celebration details..."
      >
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (!eventQuery.data) {
    return (
      <DashboardLayout
        title="Edit celebration"
        subtitle="We could not find that celebration."
      >
        <EmptyState
          title="Celebration not found"
          description="This page may have been removed or you may not have permission to edit it."
          actionLabel="Back to dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </DashboardLayout>
    );
  }

  async function handleSubmit(input: CreateEventInput) {
    await updateMutation.mutateAsync(input);
    showToast({
      title: "Celebration updated",
      description: "Your changes are live and ready to share.",
      tone: "success"
    });
  }

  return (
    <DashboardLayout
      title="Edit celebration"
      subtitle="Update the invitation details, images, and message guests will see on the public event page."
      actions={
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
      }
    >
      <div className="grid gap-4">
        <Card
          tone="polaroid"
          title="Editing notes"
          description="Keep the public experience tidy and emotionally clear before sharing or exporting the wall."
        >
          <div className="grid gap-3 text-sm leading-7 text-charcoal-900/72">
            <p>Double-check the event date, imagery, and short description.</p>
            <p>Edits here update the same details visitors see on the public event page.</p>
            <p>Save changes whenever the invitation feels ready to share again.</p>
          </div>
        </Card>

        <Card
          title="Celebration details"
          description="Keep the page polished and emotionally clear before you share it."
        >
          <CelebrationForm
            initialEvent={eventQuery.data.data.event}
            isSubmitting={updateMutation.isPending}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
