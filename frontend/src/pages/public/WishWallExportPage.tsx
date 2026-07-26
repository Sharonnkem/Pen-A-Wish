import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { GuestbookWallPreview } from "../../components/wall/GuestbookWallPreview";
import { WishWallPreview } from "../../components/wall/WishWallPreview";
import type { WishWallSettings } from "../../types/wish-wall";
import type { PublicGuestbookEntry, PublicWishPreview } from "../../types/event";

type ExportPayload = {
  source: "guestbook" | "wishes";
  event: {
    celebrantName: string;
    coverImageUrl?: string | null;
    eventDate: string;
    eventType: string;
    profileImageUrl?: string | null;
    title: string;
  };
  settings?: WishWallSettings;
  guestbookEntries?: PublicGuestbookEntry[];
  wishes?: PublicWishPreview[];
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function WishWallExportPage() {
  const [searchParams] = useSearchParams();
  const payload = useMemo<ExportPayload | null>(() => {
    const encoded = searchParams.get("payload");

    if (!encoded) {
      return null;
    }

    try {
      return JSON.parse(decodeBase64Url(encoded)) as ExportPayload;
    } catch {
      return null;
    }
  }, [searchParams]);

  if (!payload) {
    return (
      <main className="min-h-screen bg-paper p-8 text-charcoal-900">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/70 bg-white/86 p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
            Wish Wall export
          </p>
          <h1 className="mt-3 font-display text-3xl">Export data unavailable</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper p-8 text-charcoal-900">
      <div
        className="mx-auto w-[1800px] max-w-none"
        data-export-ready="true"
        data-export-wall="true"
      >
        {payload.source === "guestbook" ? (
          <GuestbookWallPreview
            celebrantName={payload.event.celebrantName}
            coverImageUrl={payload.event.coverImageUrl ?? null}
            eventDate={payload.event.eventDate}
            eventTitle={payload.event.title}
            profileImageUrl={payload.event.profileImageUrl ?? null}
            exportMode
            settings={payload.settings as WishWallSettings}
            entries={payload.guestbookEntries ?? []}
          />
        ) : (
          <WishWallPreview
            celebrantName={payload.event.celebrantName}
            coverImageUrl={payload.event.coverImageUrl ?? null}
            eventDate={payload.event.eventDate}
            eventTitle={payload.event.title}
            eventType={payload.event.eventType}
            profileImageUrl={payload.event.profileImageUrl ?? null}
            exportMode
            settings={payload.settings as WishWallSettings}
            wishes={payload.wishes ?? []}
          />
        )}
      </div>
    </main>
  );
}
