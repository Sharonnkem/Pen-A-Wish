import { motion } from "framer-motion";

import type { PublicWishPreview } from "@/types/event";
import type { WishWallSettings } from "@/types/wish-wall";
import { cn } from "@/utils/cn";

type WishWallPreviewProps = {
  celebrantName: string;
  eventDate: string;
  eventTitle: string;
  eventType: string;
  exportMode?: boolean;
  onRemoveWish?: (wishId: string) => void;
  removingWishId?: string | null;
  settings: WishWallSettings;
  wishes: PublicWishPreview[];
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

function getLayoutClass(settings: WishWallSettings) {
  if (settings.layout.mode === "stack") {
    return "grid gap-4 max-w-3xl";
  }

  const columnsClass =
    settings.layout.columns === 2
      ? "xl:columns-2"
      : settings.layout.columns === 4
        ? "xl:columns-4"
        : "xl:columns-3";

  if (settings.layout.mode === "grid") {
    return cn(
      "grid gap-4 sm:grid-cols-2",
      settings.layout.columns === 2
        ? "xl:grid-cols-2"
        : settings.layout.columns === 4
          ? "xl:grid-cols-4"
          : "xl:grid-cols-3"
    );
  }

  return cn("columns-1 gap-5 sm:columns-2", columnsClass);
}

function WishCard({
  cardTone,
  exportMode,
  isCompact,
  onRemoveWish,
  removingWishId,
  rotation,
  settings,
  styleVariant,
  theme,
  wish
}: {
  cardTone: string;
  exportMode: boolean;
  isCompact: boolean;
  onRemoveWish?: (wishId: string) => void;
  removingWishId?: string | null;
  rotation: number;
  settings: WishWallSettings;
  styleVariant: (typeof palette)[number];
  theme: (typeof themeAccents)[WishWallSettings["themePreset"]];
  wish: PublicWishPreview;
}) {
  const cardClassName = cn(
    "relative mb-5 break-inside-avoid border px-5 py-5 shadow-[0_24px_54px_rgba(67,34,53,0.14)]",
    radiusClasses[settings.cardStyle.radius],
    cardTone,
    settings.cardStyle.style === "glass" && !exportMode ? "backdrop-blur-xl" : "",
    exportMode ? "shadow-none" : "",
    settings.layout.mode === "stack" ? "w-full" : ""
  );

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

      {onRemoveWish ? (
        <button
          aria-label={`Remove ${wish.senderName}'s wish from the wall`}
          className={cn(
            "absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/88 text-plum-800 shadow-[0_10px_22px_rgba(67,34,53,0.12)] transition hover:-translate-y-0.5 hover:bg-white",
            exportMode && "shadow-none"
          )}
          disabled={removingWishId === wish.id}
          type="button"
          onClick={() => onRemoveWish(wish.id)}
        >
          <span className="text-lg leading-none">×</span>
        </button>
      ) : null}

      <div className="relative">
        <div className="h-2 w-16 rounded-full" style={{ backgroundColor: theme.accent }} />
        <div className={cn("mt-4 flex items-start justify-between gap-4", isCompact && "gap-2")}>
          <div>
            <p className="text-2xl text-plum-800" style={{ fontFamily: getTypographyFont(settings.typography.headingFont) }}>
              {wish.senderName}
            </p>
            {settings.export.showMetadata ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-charcoal-900/44">
                Wish card
              </p>
            ) : null}
          </div>
          {settings.export.showMetadata ? (
            <p className="text-xs uppercase tracking-[0.2em] text-charcoal-900/42">
              {new Date(wish.createdAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>

        <p
          className={cn(
            "mt-5 font-normal italic leading-8 text-charcoal-900/76",
            isCompact ? "text-[14px]" : "text-[15px]"
          )}
          style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
        >
          {wish.message}
        </p>

        {settings.export.showReactions && (wish.reactionCounts?.length ?? 0) ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {(wish.reactionCounts ?? []).map((reaction) => (
              <span
                key={`${wish.id}-${reaction.reactionType}`}
                className="inline-flex items-center gap-2 rounded-full border border-plum-700/10 bg-white/70 px-3 py-1 text-xs font-semibold text-plum-800"
              >
                <span>{reaction.reactionType}</span>
                <span>{reaction.count}</span>
              </span>
            ))}
          </div>
        ) : null}

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

export function WishWallPreview({
  celebrantName,
  eventDate,
  eventTitle,
  eventType,
  exportMode = false,
  onRemoveWish,
  removingWishId,
  settings,
  wishes
}: WishWallPreviewProps) {
  const theme = themeAccents[settings.themePreset];
  const headingFont = getTypographyFont(settings.typography.headingFont);
  const bodyFont = getTypographyFont(settings.typography.bodyFont);
  const cardTone = styleClasses[settings.cardStyle.style];
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
                A branded keepsake wall for {wishes.length} public wishes.
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
                <span className="font-semibold text-charcoal-900">Event type:</span> {eventType}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {settings.export.showStats ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[26px] border border-white/70 bg-white/82 p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Wishes</p>
            <p className="mt-3 text-4xl text-plum-800" style={{ fontFamily: headingFont }}>
              {wishes.length}
            </p>
          </div>
          <div className="rounded-[26px] border border-white/70 bg-white/82 p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Layout</p>
            <p className="mt-3 text-2xl text-plum-800" style={{ fontFamily: headingFont }}>
              {settings.layout.mode}
            </p>
          </div>
          <div className="rounded-[26px] border border-white/70 bg-white/82 p-4 shadow-card">
            <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Card style</p>
            <p className="mt-3 text-2xl text-plum-800" style={{ fontFamily: headingFont }}>
              {settings.cardStyle.style}
            </p>
          </div>
        </div>
      ) : null}

      <div className={getLayoutClass(settings)}>
        {wishes.length ? (
          wishes.map((wish, index) => (
            <WishCard
              key={wish.id}
              cardTone={cardTone}
              exportMode={exportMode}
              isCompact={settings.cardStyle.density === "compact"}
              onRemoveWish={onRemoveWish}
              removingWishId={removingWishId}
              rotation={getRotation(index)}
              settings={settings}
              styleVariant={palette[index % palette.length]}
              theme={theme}
              wish={wish}
            />
          ))
        ) : (
          <div className="rounded-[30px] border border-dashed border-plum-700/18 bg-white/70 p-8 text-center text-sm text-charcoal-900/68">
            <p className="text-lg font-semibold text-charcoal-900">Waiting for the first wish</p>
            <p className="mt-2">
              The editor is ready. As wishes arrive, they will appear here as scrapbook-style cards.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
