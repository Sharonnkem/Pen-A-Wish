import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Card } from "./Card";
import { Button } from "../common/Button";
import { useToast } from "../common/Toast";
import type { CelebrationEvent } from "../../types/event";

type CelebrationCardProps = {
  event: CelebrationEvent;
  onDelete: (eventId: string) => Promise<void>;
  onGenerateWall: (eventId: string) => void;
};

export function CelebrationCard({
  event,
  onDelete,
  onGenerateWall
}: CelebrationCardProps) {
  const { showToast } = useToast();
  const fallbackImage = useMemo(
    () =>
      `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320"><rect width="600" height="320" fill="#f8eee4"/><rect x="36" y="36" width="528" height="248" rx="32" fill="#ffffff"/><text x="300" y="145" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#432235">Pen A Wish</text><text x="300" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#5f324a">Celebration preview</text></svg>`
      )}`,
    []
  );

  const publicShareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return event.shareLink;
    }

    return `${window.location.origin}/events/${event.slug}`;
  }, [event.shareLink, event.slug]);

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(publicShareUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = publicShareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    showToast({
      title: "Share link copied",
      description: "You can now paste the public celebration link anywhere you like.",
      tone: "success"
    });
  }

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({
        text: `Join this celebration for ${event.celebrantName}`,
        title: event.title,
        url: publicShareUrl
      });
      return;
    }

    await handleCopyShareLink();
  }

  return (
    <Card
      tone="polaroid"
      className="h-full"
      eyebrow={event.eventType}
      title={event.title}
      description={event.description ?? "No description yet."}
      footer={
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] bg-white/70 px-4 py-3 text-sm">
              <p className="font-semibold text-charcoal-900">{event.wishesCount ?? 0}</p>
              <p className="mt-1 text-charcoal-900/58">Wishes</p>
            </div>
            <div className="rounded-[20px] bg-white/70 px-4 py-3 text-sm">
              <p className="font-semibold text-charcoal-900">{event.giftsCount ?? 0}</p>
              <p className="mt-1 text-charcoal-900/58">Gifts</p>
            </div>
            <div className="rounded-[20px] bg-white/70 px-4 py-3 text-sm">
              <p className="font-semibold text-charcoal-900">
                {new Date(event.eventDate).toLocaleDateString()}
              </p>
              <p className="mt-1 text-charcoal-900/58">Event date</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Link to={`/celebrations/${event.id}`}>
                <Button variant="secondary">Details</Button>
              </Link>
              <Link to={`/celebrations/${event.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Button variant="ghost" onClick={handleCopyShareLink}>
                Copy link
              </Button>
              <Button variant="ghost" onClick={handleNativeShare}>
                Share
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <Button variant="ghost" size="sm" onClick={() => onGenerateWall(event.id)}>
                Generate wall
              </Button>
            </div>

            <div className="border-t border-plum-700/10 pt-4">
              <Button variant="ghost" size="sm" onClick={() => onDelete(event.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)]">
        <div className="space-y-3 lg:pt-1">
          <img
            alt={`${event.celebrantName} profile`}
            className="h-24 w-24 rounded-[24px] object-cover shadow-[0_12px_30px_rgba(67,34,53,0.12)]"
            src={event.profileImageUrl || event.coverImageUrl || fallbackImage}
          />
          <p className="text-sm font-medium text-charcoal-900">{event.celebrantName}</p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/70">
          <img
            alt={`${event.title} cover`}
            className="h-44 w-full object-cover"
            src={event.coverImageUrl || event.profileImageUrl || fallbackImage}
          />
        </div>
      </div>
    </Card>
  );
}
