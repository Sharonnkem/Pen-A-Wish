import { useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import type { WishWallSettings } from "../../types/wish-wall";
import { cn } from "../../utils/cn";

type GuestbookWallEntry = {
  createdAt: string;
  id: string;
  isHidden?: boolean;
  message: string;
  senderName: string;
};

type GuestbookWallPreviewProps = {
  celebrantName: string;
  eventDate: string;
  eventTitle: string;
  exportMode?: boolean;
  onRemoveEntry?: (entryId: string) => void;
  removingEntryId?: string | null;
  settings: WishWallSettings;
  entries: GuestbookWallEntry[];
};

const fontFamilies = {
  mono: '"Courier New", Courier, monospace',
  sans: '"Jost", system-ui, sans-serif',
  serif: '"Cormorant Garamond", Georgia, serif',
  display: '"Cormorant Garamond", Georgia, serif',
  handwritten: '"Caveat", cursive'
} as const;

function getTypographyFont(key: WishWallSettings["typography"]["headingFont"]) {
  switch (key) {
    case "mono":
      return fontFamilies.mono;
    case "sans":
      return fontFamilies.sans;
    case "handwritten":
      return fontFamilies.handwritten;
    case "display":
    case "serif":
    default:
      return fontFamilies.serif;
  }
}

const themeAccents = {
  garden: { accent: "#4b6b57", glow: "rgba(201, 228, 209, 0.65)" },
  midnight: { accent: "#efe3ce", glow: "rgba(95, 50, 74, 0.35)" },
  paper: { accent: "#5f324a", glow: "rgba(247, 217, 220, 0.55)" },
  sunset: { accent: "#9d5d47", glow: "rgba(242, 198, 160, 0.55)" }
} as const;

const palette = [
  { pin: "bg-gold-400", tape: "bg-white/80", wash: "rgba(247,217,220,0.18)" },
  { pin: "bg-blush-300", tape: "bg-cream-100", wash: "rgba(248,238,228,0.2)" },
  { pin: "bg-plum-700", tape: "bg-white/75", wash: "rgba(232, 239, 245, 0.18)" },
  { pin: "bg-amber-300", tape: "bg-blush-100", wash: "rgba(255, 235, 214, 0.18)" }
] as const;

const radiusClasses = {
  large: "rounded-[32px]",
  rounded: "rounded-[26px]",
  soft: "rounded-[20px]"
} as const;

const styleClasses = {
  glass: "border-white/30 bg-white/42 backdrop-blur-xl",
  linen:
    "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,244,0.94)_100%)]",
  polaroid:
    "border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,250,244,0.95)_100%)]"
} as const;

function getRotation(index: number) {
  const values = [-2.5, 1.8, -1.4, 2.2, -0.8, 1.2];
  return values[index % values.length];
}

function getWallStyleLabel(mode: WishWallSettings["layout"]["mode"]) {
  switch (mode) {
    case "collageScrapbook":
      return "Collage Scrapbook";
    case "letterTimeline":
      return "Letter Timeline";
    case "buntingGarland":
      return "Bunting Garland";
    case "openJournal":
      return "Open Journal";
    case "masonry":
      return "Collage Scrapbook";
    case "grid":
      return "Letter Timeline";
    case "stack":
      return "Open Journal";
    default:
      return "Collage Scrapbook";
  }
}

function getLayoutClass(settings: WishWallSettings) {
  switch (settings.layout.mode) {
    case "letterTimeline":
      return "relative flex flex-col gap-y-1 py-6";
    case "buntingGarland":
      return "relative flex flex-wrap items-start justify-center gap-x-0 gap-y-12 pb-20 pt-12";
    case "openJournal":
      return "relative grid gap-6 lg:grid-cols-2 lg:gap-x-8";
    case "grid":
      return cn(
        "grid gap-4 sm:grid-cols-2",
        settings.layout.columns === 2
          ? "xl:grid-cols-2"
          : settings.layout.columns === 4
            ? "xl:grid-cols-4"
            : "xl:grid-cols-3"
      );
    case "stack":
      return "grid gap-4 max-w-3xl";
    case "collageScrapbook":
    default:
      return "relative w-full";
  }
}

function getLayoutItemClass(settings: WishWallSettings, index: number) {
  switch (settings.layout.mode) {
    case "letterTimeline":
      return cn(
        "w-full max-w-[18rem] lg:col-span-1",
        index % 2 === 0
          ? "lg:col-start-1 lg:justify-self-end"
          : "lg:col-start-3 lg:justify-self-start"
      );
    case "buntingGarland":
      return cn(
        "flex-none w-[10.25rem] -mx-1",
        index % 4 === 0
          ? "-translate-y-4"
          : index % 4 === 1
            ? "translate-y-7"
            : index % 4 === 2
              ? "translate-y-2"
              : "translate-y-8"
      );
    case "openJournal":
      return cn(
        "w-full max-w-[30rem]",
        index % 2 === 0 ? "lg:justify-self-end" : "lg:justify-self-start"
      );
    case "stack":
      return "w-full";
    case "grid":
    case "collageScrapbook":
    default:
      return "w-full";
  }
}

function getLayoutRotation(mode: WishWallSettings["layout"]["mode"], index: number) {
  if (mode === "letterTimeline") {
    return 0;
  }

  if (mode === "buntingGarland") {
    const values = [-1.6, 1.2, -0.8, 1];
    return values[index % values.length];
  }

  if (mode === "openJournal") {
    return index % 2 === 0 ? -0.6 : 0.6;
  }

  return getRotation(index);
}

function GuestbookCard({
  entry,
  exportMode,
  onRemoveEntry,
  removingEntryId,
  rotation,
  settings,
  styleVariant,
  theme,
  layoutMode
}: {
  entry: GuestbookWallEntry;
  exportMode: boolean;
  onRemoveEntry?: (entryId: string) => void;
  removingEntryId?: string | null;
  rotation: number;
  settings: WishWallSettings;
  styleVariant: (typeof palette)[number];
  theme: (typeof themeAccents)[WishWallSettings["themePreset"]];
  layoutMode: WishWallSettings["layout"]["mode"];
}) {
  const cardClassName = cn(
    "relative mb-5 break-inside-avoid border px-5 py-5 shadow-[0_24px_54px_rgba(67,34,53,0.14)]",
    radiusClasses[settings.cardStyle.radius],
    styleClasses[settings.cardStyle.style],
    settings.cardStyle.style === "glass" && !exportMode ? "backdrop-blur-xl" : "",
    exportMode ? "shadow-none" : "",
    layoutMode === "stack" ? "w-full" : "",
    layoutMode === "letterTimeline" ? "w-full max-w-[28rem]" : "",
    layoutMode === "openJournal" ? "w-full max-w-[30rem]" : "",
    layoutMode === "buntingGarland" ? "w-full max-w-[18rem]" : ""
  );

  if (layoutMode === "collageScrapbook") {
    return (
      <article
        className={cn(
          "relative overflow-hidden bg-[#fbf5ec] px-4 py-4 shadow-[0_16px_34px_rgba(67,34,53,0.08)]",
          exportMode ? "shadow-none" : ""
        )}
        style={{
          clipPath:
            "polygon(4% 1%, 12% 0%, 22% 3%, 34% 1%, 48% 4%, 63% 1%, 78% 3%, 92% 0%, 100% 9%, 98% 22%, 100% 37%, 97% 51%, 100% 66%, 98% 82%, 100% 94%, 92% 100%, 78% 97%, 64% 99%, 49% 96%, 34% 99%, 20% 97%, 7% 100%, 0 92%, 2% 78%, 0 63%, 3% 48%, 0 34%, 2% 20%, 0 7%)",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.18) 100%), radial-gradient(circle at top left, rgba(255,255,255,0.55), transparent 38%)",
          transform: `rotate(${rotation}deg)`
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(131, 106, 74, 0.03) 0, rgba(131, 106, 74, 0.03) 1px, transparent 1px, transparent 9px)" }} />
        {(entry.senderName.toLowerCase().includes("tunde") || entry.senderName.toLowerCase().includes("james")) ? (
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-[#7b2f4c]/85"
            style={{ clipPath: "polygon(0 0, 100% 10%, 92% 100%, 0 92%)", filter: "drop-shadow(2px 0 4px rgba(67,34,53,0.12))" }}
          />
        ) : null}
        <div className="relative pt-4">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#a88a6b]">{entry.senderName}</p>
          <p
            className={cn(
              "mt-2 font-normal italic leading-6 text-[#2f2f2f]",
              settings.cardStyle.density === "compact" ? "text-[13px]" : "text-[14px]"
            )}
            style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
          >
            {entry.message}
          </p>
        </div>
      </article>
    );
  }

  if (layoutMode === "letterTimeline") {
    return (
      <article
        className={cn(
          "relative w-full overflow-hidden rounded-[18px] border border-white/78 bg-white/96 px-5 py-4 shadow-[0_14px_28px_rgba(67,34,53,0.09)]",
          exportMode ? "shadow-none" : ""
        )}
        style={{ transform: "none" }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[18px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,250,244,0.38) 100%)" }} />
        <div className="relative">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#a88a6b]">
            {entry.senderName}
          </p>
          <p
            className={cn(
              "mt-3 text-[1rem] leading-7 text-[#2f2f2f]",
              settings.cardStyle.density === "compact" ? "text-[0.95rem]" : "text-[1rem]"
            )}
            style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
          >
            {entry.message}
          </p>
        </div>
      </article>
    );
  }

  if (layoutMode === "buntingGarland") {
    return (
      <article
        className={cn(
          "relative mb-5 break-inside-avoid overflow-hidden bg-[#fefcfa] px-4 pb-6 pt-4 shadow-[0_20px_48px_rgba(67,34,53,0.1)]",
          exportMode ? "shadow-none" : "",
          "w-full max-w-[10.75rem]"
        )}
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
          transform: `rotate(${rotation}deg)`
        }}
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 -translate-y-[1px] bg-[#d8b98f]/80" />
        <div
          className="pointer-events-none absolute left-1/2 top-2 h-[2px] w-[calc(100%+2.5rem)] -translate-x-1/2"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, rgba(216,185,143,0.95) 0 8px, transparent 8px 14px)"
          }}
        />
        <div className="relative pt-6">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#a88a6b]">{entry.senderName}</p>
          <p
            className={cn(
              "mt-2 font-normal italic leading-6 text-[#2f2f2f]",
              settings.cardStyle.density === "compact" ? "text-[13px]" : "text-[14px]"
            )}
            style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
          >
            {entry.message}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className={cardClassName} style={{ transform: `rotate(${rotation}deg)` }}>
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-0 h-7 w-20 -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-b-[18px]",
          styleVariant.tape
        )}
        style={{ boxShadow: "0 8px 16px rgba(67,34,53,0.08)" }}
      />
      <div
        className={cn("pointer-events-none absolute right-5 top-5 h-3 w-3 rounded-full", styleVariant.pin)}
        style={{ boxShadow: "0 8px 16px rgba(67,34,53,0.18)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[30px]"
        style={{
          backgroundImage: `radial-gradient(circle at top left, ${styleVariant.wash}, transparent 42%)`
        }}
      />

      {onRemoveEntry ? (
        <button
          aria-label={`Remove ${entry.senderName}'s memory from the wall`}
          className={cn(
            "absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/88 text-plum-800 shadow-[0_10px_22px_rgba(67,34,53,0.12)] transition hover:-translate-y-0.5 hover:bg-white",
            exportMode && "shadow-none"
          )}
          disabled={removingEntryId === entry.id}
          type="button"
          onClick={() => onRemoveEntry(entry.id)}
        >
          <span className="text-lg leading-none">×</span>
        </button>
      ) : null}

      <div className="relative">
        <div className="h-2 w-16 rounded-full" style={{ backgroundColor: theme.accent }} />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p
              className="text-2xl text-plum-800"
              style={{ fontFamily: getTypographyFont(settings.typography.headingFont) }}
            >
              {entry.senderName}
            </p>
            {settings.export.showMetadata ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-charcoal-900/44">
                Guestbook memory
              </p>
            ) : null}
          </div>
          {settings.export.showMetadata ? (
            <p className="text-xs uppercase tracking-[0.2em] text-charcoal-900/42">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>

        {entry.isHidden ? (
          <p className="mt-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
            Hidden memory
          </p>
        ) : null}

        <p
          className={cn(
            "mt-5 font-normal italic leading-8 text-charcoal-900/76",
            settings.cardStyle.density === "compact" ? "text-[14px]" : "text-[15px]"
          )}
          style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
        >
          {entry.message}
        </p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-plum-700">
            Memory kept
          </span>
          <span className="text-xs text-charcoal-900/42">Pen A Wish</span>
        </div>
      </div>
    </article>
  );
}

export function GuestbookWallPreview({
  celebrantName,
  eventDate,
  eventTitle,
  exportMode = false,
  onRemoveEntry,
  removingEntryId,
  settings,
  entries
}: GuestbookWallPreviewProps) {
  const [timelinePage, setTimelinePage] = useState(0);
  const [collagePage, setCollagePage] = useState(0);
  const [buntingPage, setBuntingPage] = useState(0);
  const [journalPage, setJournalPage] = useState(0);
  const theme = themeAccents[settings.themePreset];
  const headingFont = getTypographyFont(settings.typography.headingFont);
  const bodyFont = getTypographyFont(settings.typography.bodyFont);
  const wallStyle = settings.layout.mode;
  const hasBackgroundImage = settings.background.mode === "image" && settings.background.imageUrl;
  const backgroundStyle =
    settings.background.mode === "solid"
      ? { backgroundColor: settings.background.color }
      : settings.background.mode === "image" && hasBackgroundImage
        ? {
            backgroundImage: `linear-gradient(180deg, rgba(255,250,244,0.36), rgba(248,238,228,0.6)), url(${settings.background.imageUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          }
        : {
            backgroundImage: `linear-gradient(180deg, ${settings.background.gradientStart} 0%, ${settings.background.gradientEnd} 100%)`
          };
  const timelinePageSize = 4;
  const totalTimelinePages = Math.max(1, Math.ceil(entries.length / timelinePageSize));
  const collagePageSize = 9;
  const totalCollagePages = Math.max(1, Math.ceil(entries.length / collagePageSize));
  const buntingPageSize = 8;
  const totalBuntingPages = Math.max(1, Math.ceil(entries.length / buntingPageSize));
  const journalPageSize = 8;
  const totalJournalPages = Math.max(1, Math.ceil(entries.length / journalPageSize));
  const timelineEntries = useMemo(() => {
    if (wallStyle !== "letterTimeline") {
      return entries;
    }

    const start = timelinePage * timelinePageSize;
    return entries.slice(start, start + timelinePageSize);
  }, [entries, timelinePage, timelinePageSize, wallStyle]);

  const collageEntries = useMemo(() => {
    if (wallStyle !== "collageScrapbook") {
      return entries;
    }

    const start = collagePage * collagePageSize;
    return entries.slice(start, start + collagePageSize);
  }, [collagePage, collagePageSize, entries, wallStyle]);
  const buntingEntries = useMemo(() => {
    if (wallStyle !== "buntingGarland") {
      return entries;
    }

    const start = buntingPage * buntingPageSize;
    return entries.slice(start, start + buntingPageSize);
  }, [buntingPage, buntingPageSize, entries, wallStyle]);
  const journalEntries = useMemo(() => {
    if (wallStyle !== "openJournal") {
      return entries;
    }

    const start = journalPage * journalPageSize;
    return entries.slice(start, start + journalPageSize);
  }, [entries, journalPage, journalPageSize, wallStyle]);

  useEffect(() => {
    if (timelinePage > totalTimelinePages - 1) {
      setTimelinePage(Math.max(0, totalTimelinePages - 1));
    }
  }, [timelinePage, totalTimelinePages]);

  useEffect(() => {
    if (collagePage > totalCollagePages - 1) {
      setCollagePage(Math.max(0, totalCollagePages - 1));
    }
  }, [collagePage, totalCollagePages]);

  useEffect(() => {
    if (buntingPage > totalBuntingPages - 1) {
      setBuntingPage(Math.max(0, totalBuntingPages - 1));
    }
  }, [buntingPage, totalBuntingPages]);

  useEffect(() => {
    if (journalPage > totalJournalPages - 1) {
      setJournalPage(Math.max(0, totalJournalPages - 1));
    }
  }, [journalPage, totalJournalPages]);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[36px] border border-white/70 p-4 shadow-card sm:p-6",
        exportMode && "shadow-none"
      )}
      style={{
        ...backgroundStyle,
        fontFamily: bodyFont
      }}
    >
      {!exportMode ? (
        <>
          <div
            className="pointer-events-none absolute left-6 top-6 h-20 w-20 rounded-full blur-2xl"
            style={{ backgroundColor: theme.glow }}
          />
          <div className="pointer-events-none absolute bottom-10 right-10 h-24 w-24 rounded-full bg-gold-400/15 blur-3xl" />
          <div className="pointer-events-none absolute right-6 top-8 h-10 w-28 rotate-6 rounded-full border border-white/60 bg-white/45" />
          <div className="pointer-events-none absolute bottom-8 left-8 h-10 w-24 -rotate-12 rounded-full border border-white/50 bg-cream-100/55" />
        </>
      ) : null}

      {settings.export.showHeader ? (
        <div className="relative mb-6 rounded-[28px] border border-white/70 bg-white/76 px-5 py-5 shadow-[0_18px_40px_rgba(67,34,53,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">Pen A Wish</p>
              <h2 className="mt-3 text-4xl text-charcoal-900" style={{ fontFamily: headingFont }}>
                {eventTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-charcoal-900/68">
                A memory book for {celebrantName} with {entries.length} guestbook entries.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-charcoal-900/68 md:text-right">
              <p>
                <span className="font-semibold text-charcoal-900">Celebrant:</span> {celebrantName}
              </p>
              <p>
                <span className="font-semibold text-charcoal-900">Event date:</span>{" "}
                {new Date(eventDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold text-charcoal-900">Guestbook:</span> Memory notes
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {settings.export.showStats ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[26px] border border-white/70 bg-white/82 p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Memories</p>
            <p className="mt-3 text-4xl text-plum-800" style={{ fontFamily: headingFont }}>
              {entries.length}
            </p>
          </div>
          <div className="rounded-[26px] border border-white/70 bg-white/82 p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Layout</p>
            <p className="mt-3 text-2xl text-plum-800" style={{ fontFamily: headingFont }}>
              {getWallStyleLabel(wallStyle)}
            </p>
          </div>
          <div className="rounded-[26px] border border-white/70 bg-white/82 p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Wall Style</p>
            <p className="mt-3 text-2xl text-plum-800" style={{ fontFamily: headingFont }}>
              {settings.cardStyle.style}
            </p>
          </div>
        </div>
      ) : null}

      {wallStyle === "openJournal" ? (
        <div className="overflow-hidden rounded-[34px] border border-[#e1caa6] bg-[#f1debf] p-5 shadow-[0_24px_72px_rgba(67,34,53,0.12)]">
          <p className="mb-4 text-center text-[0.82rem] italic text-plum-700/88" style={{ fontFamily: headingFont }}>
            A keepsake you could almost hold
          </p>
          <div className="grid overflow-hidden rounded-[28px] border border-white/55 bg-[#fbf7ef] shadow-[0_20px_48px_rgba(67,34,53,0.12)] lg:grid-cols-2">
            {[
              {
                number: "- 1 -",
                title: `- memories for ${celebrantName} -`,
                items: journalEntries.slice(0, Math.ceil(journalEntries.length / 2))
              },
              {
                number: "- 2 -",
                title: "- continued -",
                items: journalEntries.slice(Math.ceil(journalEntries.length / 2))
              }
            ].map((page, pageIndex) => (
              <section
                key={page.title}
                className={`relative min-h-[26rem] px-5 py-5 sm:px-6 ${pageIndex === 0 ? "lg:border-r lg:border-[#edd8bc]" : ""}`}
              >
                <p className="text-center text-[1.05rem] italic text-plum-700" style={{ fontFamily: headingFont }}>
                  {page.title}
                </p>
                <div className="mt-5 space-y-4">
                  {page.items.length ? (
                    page.items.map((entry, index) => (
                      <div key={entry.id} className="pb-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-charcoal-900/42">
                          {entry.senderName}
                        </p>
                        <p
                          className="mt-2 font-normal italic text-[1rem] leading-7 text-plum-800"
                          style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
                        >
                          {entry.message}
                        </p>
                        {index < page.items.length - 1 ? (
                          <div className="mt-4 border-b border-dashed border-[#e7cfa8]" />
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-plum-700/14 bg-white/72 p-6 text-center text-sm text-charcoal-900/60">
                      No memories yet.
                    </div>
                  )}
                </div>
                <p className="absolute bottom-4 right-5 text-xs italic text-charcoal-900/48">{page.number}</p>
              </section>
            ))}
          </div>
          {!exportMode && totalJournalPages > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                className="inline-flex h-10 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-sm text-plum-800 shadow-[0_8px_18px_rgba(67,34,53,0.06)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                disabled={journalPage === 0}
                type="button"
                onClick={() => setJournalPage((value) => Math.max(0, value - 1))}
              >
                Prev
              </button>
              <span className="text-xs uppercase tracking-[0.22em] text-charcoal-900/55">
                Page {journalPage + 1} of {totalJournalPages}
              </span>
              <button
                className="inline-flex h-10 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-sm text-plum-800 shadow-[0_8px_18px_rgba(67,34,53,0.06)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                disabled={journalPage >= totalJournalPages - 1}
                type="button"
                onClick={() => setJournalPage((value) => Math.min(totalJournalPages - 1, value + 1))}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className={getLayoutClass(settings)}>
          {wallStyle === "collageScrapbook" ? (
            <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {collageEntries.length ? (
                collageEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "transform",
                      index % 3 === 0 ? "sm:-mt-1 sm:rotate-[-1.5deg]" : "",
                      index % 3 === 1 ? "sm:mt-4 sm:rotate-[1.2deg]" : "",
                      index % 3 === 2 ? "sm:-mt-2 sm:rotate-[-0.8deg]" : ""
                    )}
                  >
                    <GuestbookCard
                      entry={entry}
                      exportMode={exportMode}
                      layoutMode={wallStyle}
                      onRemoveEntry={onRemoveEntry}
                      removingEntryId={removingEntryId}
                      rotation={getLayoutRotation(wallStyle, index)}
                      settings={settings}
                      styleVariant={palette[index % palette.length]}
                      theme={theme}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-[30px] border border-dashed border-[#e2c29d] bg-white/62 p-8 text-center text-sm text-charcoal-900/68">
                  <p className="text-lg font-semibold text-charcoal-900">Waiting for the first memory</p>
                  <p className="mt-2">This scrapbook will fill with torn paper notes as memories arrive.</p>
                </div>
              )}
              {!exportMode && totalCollagePages > 1 ? (
                <div className="col-span-full mt-2 flex items-center justify-center gap-3">
                  <button
                    className="inline-flex h-9 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-plum-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={collagePage === 0}
                    type="button"
                    onClick={() => setCollagePage((value) => Math.max(0, value - 1))}
                  >
                    Prev
                  </button>
                  <span className="text-[0.68rem] uppercase tracking-[0.22em] text-charcoal-900/55">
                    Page {collagePage + 1} of {totalCollagePages}
                  </span>
                  <button
                    className="inline-flex h-9 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-plum-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={collagePage >= totalCollagePages - 1}
                    type="button"
                    onClick={() => setCollagePage((value) => Math.min(totalCollagePages - 1, value + 1))}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          ) : wallStyle === "letterTimeline" ? (
            <>
              <div className="pointer-events-none absolute left-1/2 top-2 hidden h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-[#c78f68] lg:block" />
              {timelineEntries.length ? (
                timelineEntries.map((entry, index) => {
                  const isLeft = index % 2 === 0;

                  return (
                    <div
                      key={entry.id}
                      className="relative grid w-full gap-4 py-5 lg:grid-cols-2 lg:gap-x-12 lg:py-5"
                    >
                      <div
                        className={cn(
                          "w-full max-w-[280px] lg:self-center",
                          isLeft ? "lg:col-start-1 lg:justify-self-end" : "lg:col-start-2 lg:justify-self-start"
                        )}
                      >
                        <GuestbookCard
                          entry={entry}
                          exportMode={exportMode}
                          layoutMode={wallStyle}
                          onRemoveEntry={onRemoveEntry}
                          removingEntryId={removingEntryId}
                          rotation={0}
                          settings={settings}
                          styleVariant={palette[index % palette.length]}
                          theme={theme}
                        />
                      </div>

                      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#f0e0ca] bg-[#f8f1ea] shadow-[0_8px_18px_rgba(67,34,53,0.08)]">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#7f3650]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[30px] border border-dashed border-plum-700/18 bg-white/70 p-8 text-center text-sm text-charcoal-900/68 lg:col-span-2">
                  <p className="text-lg font-semibold text-charcoal-900">Waiting for the first memory</p>
                  <p className="mt-2">
                    The timeline is ready. As memories arrive, they will appear here as floating letters.
                  </p>
                </div>
              )}
              {!exportMode && totalTimelinePages > 1 ? (
                <div className="mt-2 flex items-center justify-center gap-3">
                  <button
                    className="inline-flex h-10 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-sm text-plum-800 shadow-[0_8px_18px_rgba(67,34,53,0.06)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={timelinePage === 0}
                    type="button"
                    onClick={() => setTimelinePage((value) => Math.max(0, value - 1))}
                  >
                    Prev
                  </button>
                  <span className="text-xs uppercase tracking-[0.22em] text-charcoal-900/55">
                    Page {timelinePage + 1} of {totalTimelinePages}
                  </span>
                  <button
                    className="inline-flex h-10 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-sm text-plum-800 shadow-[0_8px_18px_rgba(67,34,53,0.06)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={timelinePage >= totalTimelinePages - 1}
                    type="button"
                    onClick={() => setTimelinePage((value) => Math.min(totalTimelinePages - 1, value + 1))}
                  >
                    Next
                  </button>
                </div>
              ) : null}
              <div className="pointer-events-none absolute bottom-0 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#4b4a49] shadow-[0_16px_30px_rgba(37,35,34,0.32)]">
                <span className="text-lg leading-none text-white">↓</span>
              </div>
            </>
          ) : wallStyle === "buntingGarland" ? (
            <>
              <div className="pointer-events-none absolute left-4 right-4 top-8 h-px border-t border-dashed border-plum-700/20" />
              {buntingEntries.length ? (
                buntingEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className={getLayoutItemClass(settings, index)}
                    initial={exportMode ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                  >
                    <GuestbookCard
                      entry={entry}
                      exportMode={exportMode}
                      layoutMode={wallStyle}
                      onRemoveEntry={onRemoveEntry}
                      removingEntryId={removingEntryId}
                      rotation={getLayoutRotation(wallStyle, index)}
                      settings={settings}
                      styleVariant={palette[index % palette.length]}
                      theme={theme}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[30px] border border-dashed border-plum-700/18 bg-white/70 p-8 text-center text-sm text-charcoal-900/68 sm:col-span-2">
                  <p className="text-lg font-semibold text-charcoal-900">Waiting for the first memory</p>
                  <p className="mt-2">
                    Once guests leave longer notes, they will appear here as scrapbook-style guestbook cards.
                  </p>
                </div>
              )}
              {!exportMode && totalBuntingPages > 1 ? (
                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-3">
                  <button
                    className="inline-flex h-10 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-sm text-plum-800 shadow-[0_8px_18px_rgba(67,34,53,0.06)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={buntingPage === 0}
                    type="button"
                    onClick={() => setBuntingPage((value) => Math.max(0, value - 1))}
                  >
                    Prev
                  </button>
                  <span className="text-xs uppercase tracking-[0.22em] text-charcoal-900/55">
                    Page {buntingPage + 1} of {totalBuntingPages}
                  </span>
                  <button
                    className="inline-flex h-10 items-center rounded-full border border-[#ead9c2] bg-white/84 px-4 text-sm text-plum-800 shadow-[0_8px_18px_rgba(67,34,53,0.06)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={buntingPage >= totalBuntingPages - 1}
                    type="button"
                    onClick={() => setBuntingPage((value) => Math.min(totalBuntingPages - 1, value + 1))}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : entries.length ? (
            entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                className={getLayoutItemClass(settings, index)}
                initial={exportMode ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <GuestbookCard
                  entry={entry}
                  exportMode={exportMode}
                  layoutMode={wallStyle}
                  onRemoveEntry={onRemoveEntry}
                  removingEntryId={removingEntryId}
                  rotation={getLayoutRotation(wallStyle, index)}
                  settings={settings}
                  styleVariant={palette[index % palette.length]}
                  theme={theme}
                />
              </motion.div>
            ))
          ) : (
            <div className="rounded-[30px] border border-dashed border-plum-700/18 bg-white/70 p-8 text-center text-sm text-charcoal-900/68 sm:col-span-2">
              <p className="text-lg font-semibold text-charcoal-900">Waiting for the first memory</p>
              <p className="mt-2">
                Once guests leave longer notes, they will appear here as scrapbook-style guestbook cards.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}




