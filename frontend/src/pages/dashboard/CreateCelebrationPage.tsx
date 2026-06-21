import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { useToast } from "@/components/common/Toast";
import { CelebrationForm } from "@/components/forms/CelebrationForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError } from "@/services/api";
import { eventService } from "@/services/event.service";
import type { CreateEventInput } from "@/types/event";

export function CreateCelebrationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createMutation = useMutation({
    mutationFn: (input: CreateEventInput) => eventService.createEvent(input),
    onError: (error) => {
      showToast({
        title: "Celebration creation failed",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not create the celebration right now.",
        tone: "error"
      });
    }
  });

  async function handleSubmit(input: CreateEventInput) {
    const response = await createMutation.mutateAsync(input);
    showToast({
      title: "Celebration created",
      description: "Your page is ready and the share link has been prepared.",
      tone: "success"
    });
    navigate(`/celebrations/${response.data.event.id}/edit`, { replace: true });
  }

  return (
    <DashboardLayout
      title="Create a celebration"
      subtitle="Add the exact event details guests will see on the public page. The unique slug and share link are handled automatically."
    >
      <div className="grid gap-4">
        <Card
          tone="polaroid"
          title="Before you publish"
          description="Treat this page like a warm invitation. Keep the title, event type, and imagery easy for guests to recognize instantly."
        >
          <div className="grid gap-3 text-sm leading-7 text-charcoal-900/72">
            <p>Use a clear celebration title and a recognizable celebrant name.</p>
            <p>Choose visuals that feel polished on both desktop and mobile browsers.</p>
            <p>The slug and public share link are created automatically after submission.</p>
          </div>
        </Card>

        <Card
          title="Celebration details"
          description="Build the event like an invitation: celebrant, title, type, date, images, and a warm short description."
        >
          <CelebrationForm
            isSubmitting={createMutation.isPending}
            onSubmit={handleSubmit}
            submitLabel="Create celebration"
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
