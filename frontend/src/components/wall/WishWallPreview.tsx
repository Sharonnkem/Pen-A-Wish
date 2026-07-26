import { useEffect, useMemo, useState } from "react";

import type { PublicWishPreview } from "../../types/event";
import type { WishWallSettings } from "../../types/wish-wall";
import { cn } from "../../utils/cn";

type WishWallPreviewProps = {
  celebrantName: string;
  coverImageUrl?: string | null;
  eventDate: string;
  eventTitle: string;
  eventType: string;
  profileImageUrl?: string | null;
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
  { accent: "#d9a84a", pin: "bg-gold-400", tape: "bg-white/80", wash: "rgba(247,217,220,0.18)" },
  { accent: "#bb80de", pin: "bg-blush-300", tape: "bg-cream-100", wash: "rgba(248,238,228,0.2)" },
  { accent: "#6b87e1", pin: "bg-plum-700", tape: "bg-white/75", wash: "rgba(232, 239, 245, 0.18)" },
  { accent: "#e26c9e", pin: "bg-amber-300", tape: "bg-blush-100", wash: "rgba(255, 235, 214, 0.18)" }
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
  void mode;
  return "Wish Wall Poster";
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
      return "relative w-full";
    case "stack":
      return "relative w-full";
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


function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;
  const int = Number.parseInt(value, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type CollageLayer = "micro" | "mini" | "standard" | "featured";

type CollageSlotPoint = {
  left: number;
  top: number;
  width: number;
};

type CollageRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type CollagePlacement = {
  left: string;
  top: string;
  width: string;
  minWidth: string;
};

const COLLAGE_CANVAS_WIDTH_PX = 1248;
const COLLAGE_BASE_HEIGHT_PX = 720;

const HERO_SAFE_ZONE_PCT = {
  left: 42,
  top: 25,
  right: 58,
  bottom: 70
} as const;

const LAYER_DESIGN_CAPACITY = {
  standard: 6,
  mini: 20,
  micro: 20
} as const;

const LAYER_GROWTH_BUDGET_PX = {
  standard: 190,
  mini: 90,
  micro: 65
} as const;

function computeCollageCanvasHeightPx(
  standardCount: number,
  miniCount: number,
  microCount: number,
  baseHeightPx = COLLAGE_BASE_HEIGHT_PX
) {
  const extraStandard = Math.max(0, standardCount - LAYER_DESIGN_CAPACITY.standard) * LAYER_GROWTH_BUDGET_PX.standard;
  const extraMini = Math.max(0, miniCount - LAYER_DESIGN_CAPACITY.mini) * LAYER_GROWTH_BUDGET_PX.mini;
  const extraMicro = Math.max(0, microCount - LAYER_DESIGN_CAPACITY.micro) * LAYER_GROWTH_BUDGET_PX.micro;

  return baseHeightPx + extraStandard + extraMini + extraMicro;
}

const LAYER_TEXT_LIMITS: Record<CollageLayer, { message: number; sender: number }> = {
  featured: { message: 220, sender: 30 },
  standard: { message: 140, sender: 26 },
  mini: { message: 90, sender: 22 },
  micro: { message: 60, sender: 18 }
};

function truncateText(text: string, maxChars: number) {
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}
function getCollagePositions(layer: CollageLayer): CollageSlotPoint[] {
  const featuredPositions: CollageSlotPoint[] = [
    { left: 3, top: 4, width: 11 },
    { left: 22, top: 5, width: 10.5 },
    { left: 58, top: 5, width: 10.5 },
    { left: 74, top: 4, width: 10.5 },
    { left: 5, top: 22, width: 10.5 },
    { left: 63, top: 22, width: 10.5 },
    { left: 16, top: 38, width: 10.5 },
    { left: 64, top: 39, width: 10.5 },
    { left: 5, top: 72, width: 10.5 },
    { left: 60, top: 72, width: 10.5 }
  ];

  const standardPositions: CollageSlotPoint[] = [
    { left: 28, top: 3, width: 10 },
    { left: 46, top: 3, width: 9.5 },
    { left: 4, top: 18, width: 9.2 },
    { left: 20, top: 19, width: 9.2 },
    { left: 52, top: 18, width: 9.2 },
    { left: 70, top: 19, width: 9 },
    { left: 10, top: 42, width: 9.4 },
    { left: 60, top: 41, width: 9.4 },
    { left: 24, top: 44, width: 9.2 },
    { left: 46, top: 44, width: 9.2 },
    { left: 22, top: 58, width: 9.4 },
    { left: 48, top: 58, width: 9.4 },
    { left: 18, top: 74, width: 10 },
    { left: 40, top: 76, width: 9.6 },
    { left: 60, top: 75, width: 9.6 },
    { left: 76, top: 58, width: 9.2 }
  ];

  const miniPositions: CollageSlotPoint[] = [
    { left: 8, top: 8, width: 4.4 },
    { left: 18, top: 10, width: 4.4 },
    { left: 60, top: 9, width: 4.4 },
    { left: 70, top: 10, width: 4.4 },
    { left: 18, top: 24, width: 4.4 },
    { left: 60, top: 24, width: 4.4 },
    { left: 4, top: 32, width: 4.4 },
    { left: 14, top: 32, width: 4.4 },
    { left: 66, top: 32, width: 4.4 },
    { left: 76, top: 32, width: 4.4 },
    { left: 4, top: 46, width: 4.4 },
    { left: 16, top: 46, width: 4.4 },
    { left: 64, top: 46, width: 4.4 },
    { left: 76, top: 46, width: 4.4 },
    { left: 6, top: 60, width: 4.4 },
    { left: 18, top: 62, width: 4.4 },
    { left: 60, top: 62, width: 4.4 },
    { left: 72, top: 62, width: 4.4 },
    { left: 12, top: 76, width: 4.4 },
    { left: 34, top: 78, width: 4.4 },
    { left: 58, top: 78, width: 4.4 },
    { left: 76, top: 78, width: 4.4 }
  ];

  const microPositions: CollageSlotPoint[] = [
    { left: 24, top: 10, width: 3.2 },
    { left: 50, top: 10, width: 3.2 },
    { left: 24, top: 22, width: 3.2 },
    { left: 50, top: 22, width: 3.2 },
    { left: 18, top: 34, width: 3.2 },
    { left: 56, top: 34, width: 3.2 },
    { left: 18, top: 48, width: 3.2 },
    { left: 56, top: 48, width: 3.2 },
    { left: 28, top: 36, width: 3.2 },
    { left: 46, top: 36, width: 3.2 },
    { left: 28, top: 54, width: 3.2 },
    { left: 46, top: 54, width: 3.2 },
    { left: 20, top: 62, width: 3.2 },
    { left: 54, top: 62, width: 3.2 },
    { left: 14, top: 76, width: 3.2 },
    { left: 60, top: 76, width: 3.2 },
    { left: 0, top: 12, width: 3.2 },
    { left: 0, top: 26, width: 3.2 },
    { left: 0, top: 50, width: 3.2 },
    { left: 0, top: 74, width: 3.2 },
    { left: 0, top: 88, width: 3.2 },
    { left: 76, top: 8, width: 3.2 },
    { left: 76, top: 22, width: 3.2 },
    { left: 76, top: 40, width: 3.2 },
    { left: 76, top: 74, width: 3.2 },
    { left: 76, top: 88, width: 3.2 },
    { left: 10, top: 0, width: 3.2 },
    { left: 24, top: 0, width: 3.2 },
    { left: 56, top: 0, width: 3.2 },
    { left: 68, top: 0, width: 3.2 },
    { left: 34, top: 0, width: 3.2 },
    { left: 46, top: 0, width: 3.2 },
    { left: 12, top: 92, width: 3.2 },
    { left: 28, top: 92, width: 3.2 },
    { left: 54, top: 92, width: 3.2 },
    { left: 68, top: 92, width: 3.2 }
  ];

  switch (layer) {
    case "featured":
      return featuredPositions;
    case "standard":
      return standardPositions;
    case "mini":
      return miniPositions;
    case "micro":
    default:
      return microPositions;
  }
}


function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function estimateCollageHeight(wish: PublicWishPreview, layer: CollageLayer, widthRem: number) {
  const message = wish.message;
  const senderName = wish.senderName;

  const widthPx = widthRem * 16;
  const fontSize =
    layer === "standard" ? 10.5 : layer === "mini" ? 9.6 : 8.8;
  const charsPerLine = clampNumber(Math.floor(widthPx / (fontSize * 0.62)), 6, 44);
  const messageLines = Math.max(1, Math.ceil(message.length / charsPerLine));
  const senderLines = Math.max(1, Math.ceil(senderName.length / Math.max(charsPerLine, 10)));
  const basePadding = layer === "standard" ? 64 : layer === "mini" ? 54 : 48;
  const messageLineHeight = layer === "standard" ? 1.42 : layer === "mini" ? 1.34 : 1.28;
  const senderHeight = senderLines * fontSize * 1.28;
  const messageHeight = messageLines * fontSize * messageLineHeight;
  const safetyBuffer = layer === "standard" ? 22 : layer === "mini" ? 18 : 16;

  return Math.ceil(basePadding + senderHeight + messageHeight + safetyBuffer);
}

function rectsOverlap(a: CollageRect, b: CollageRect, padding = 6) {
  return !(
    a.right + padding <= b.left ||
    a.left >= b.right + padding ||
    a.bottom + padding <= b.top ||
    a.top >= b.bottom + padding
  );
}

function buildCollageRect(
  leftPct: number,
  topPct: number,
  widthRem: number,
  heightPx: number,
  canvasWidthPx: number,
  canvasHeightPx: number
) {
  const left = (leftPct / 100) * canvasWidthPx;
  const top = (topPct / 100) * canvasHeightPx;
  const width = widthRem * 16;

  return {
    left,
    top,
    right: left + width,
    bottom: top + heightPx
  };
}

function getCollageHeroRect(canvasWidthPx: number, canvasHeightPx: number) {
  const marginPx = 10;

  return {
    left: (HERO_SAFE_ZONE_PCT.left / 100) * canvasWidthPx - marginPx,
    top: (HERO_SAFE_ZONE_PCT.top / 100) * canvasHeightPx - marginPx,
    right: (HERO_SAFE_ZONE_PCT.right / 100) * canvasWidthPx + marginPx,
    bottom: (HERO_SAFE_ZONE_PCT.bottom / 100) * canvasHeightPx + marginPx
  };
}

function findFreeGridSlot(
  widthRem: number,
  heightPx: number,
  occupied: CollageRect[],
  canvasWidthPx: number,
  canvasHeightPx: number,
  padding = 6
) {
  const widthPx = widthRem * 16;
  const maxLeftPct = clampNumber(100 - (widthPx / canvasWidthPx) * 100, 0, 100);
  const maxTopPct = clampNumber(100 - (heightPx / canvasHeightPx) * 100, 0, 100);
  const stepPct = 1;
  const buildCenterOutValues = (maxPct: number) =>
    Array.from({ length: Math.floor(maxPct / stepPct) + 1 }, (_, index) => index * stepPct).sort(
      (a, b) => Math.abs(a - maxPct / 2) - Math.abs(b - maxPct / 2)
    );
  const topValues = buildCenterOutValues(maxTopPct);
  const leftValues = buildCenterOutValues(maxLeftPct);

  for (const topPct of topValues) {
    for (const leftPct of leftValues) {
      const rect = buildCollageRect(leftPct, topPct, widthRem, heightPx, canvasWidthPx, canvasHeightPx);

      if (!occupied.some((entry) => rectsOverlap(rect, entry, padding))) {
        return { leftPct, topPct };
      }
    }
  }

  return null;
}

function getCollageSlotVariants(layer: CollageLayer, cycle: number) {
  const cycleBoost = cycle > 0 ? Math.min(cycle, 3) : 0;
  const spread = layer === "micro" ? 2.2 : layer === "mini" ? 3.6 : 4.8;
  return [
    { x: 0, y: 0 },
    { x: spread + cycleBoost * 0.45, y: 1.25 + cycleBoost * 0.35 },
    { x: -(spread - 0.45), y: 2 + cycleBoost * 0.55 },
    { x: spread * 0.55, y: 5.25 + cycleBoost * 0.8 },
    { x: -(spread * 0.55), y: 5.5 + cycleBoost * 0.8 },
    { x: spread * 0.8, y: 8 + cycleBoost * 0.9 },
    { x: -(spread * 0.8), y: 8 + cycleBoost * 0.9 }
  ];
}

function getCollagePlacementCandidates(index: number, layer: CollageLayer) {
  const positions = getCollagePositions(layer);
  const startIndex = index % positions.length;
  const cycle = Math.floor(index / positions.length);
  const orderedIndices = positions.map((_, offset) => (startIndex + offset) % positions.length);
  const variants = getCollageSlotVariants(layer, cycle);

  return orderedIndices.flatMap((positionIndex) => {
    const point = positions[positionIndex];

    return variants.map((variant) => ({
      leftPct: clampNumber(point.left + variant.x, 0, 100),
      topPct: clampNumber(point.top + variant.y, 0, 100),
      widthRem: point.width
    }));
  });
}

function buildCollisionSafeCollagePlacements(
  wishes: PublicWishPreview[],
  layer: CollageLayer,
  occupied: CollageRect[],
  canvasWidthPx: number,
  canvasHeightPx: number,
  exportMode = false
) {
  const collisionPadding = exportMode ? 10 : 6;

  return wishes.map((wish, index) => {
    const contentWidthRem = Number.parseFloat(getCollageCardWidth(wish, layer, exportMode));
    const baseWidthRem = contentWidthRem;
    const baseHeightPx = estimateCollageHeight(wish, layer, baseWidthRem);
    const candidates = getCollagePlacementCandidates(index, layer);

    for (const candidate of candidates) {
      const availableRightRem = Math.max(
        4,
        ((canvasWidthPx - (candidate.leftPct / 100) * canvasWidthPx) / 16) - 0.5
      );
      const widthRem = Math.min(contentWidthRem, availableRightRem);
      const candidateHeightPx = estimateCollageHeight(wish, layer, widthRem);
      const rect = buildCollageRect(candidate.leftPct, candidate.topPct, widthRem, candidateHeightPx, canvasWidthPx, canvasHeightPx);

      if (!occupied.some((entry) => rectsOverlap(rect, entry, collisionPadding))) {
        occupied.push(rect);
        return {
          left: `${candidate.leftPct}%`,
          top: `${candidate.topPct}%`,
          width: `${widthRem}rem`,
          minWidth: `${widthRem}rem`
        } satisfies CollagePlacement;
      }
    }

    const widthRem = contentWidthRem;
    const heightPx = baseHeightPx;

    const gridSlot = findFreeGridSlot(widthRem, heightPx, occupied, canvasWidthPx, canvasHeightPx, collisionPadding);

    if (gridSlot) {
      const rect = buildCollageRect(gridSlot.leftPct, gridSlot.topPct, widthRem, heightPx, canvasWidthPx, canvasHeightPx);
      occupied.push(rect);

      return {
        left: `${gridSlot.leftPct}%`,
        top: `${gridSlot.topPct}%`,
        width: `${widthRem}rem`,
        minWidth: `${widthRem}rem`
      } satisfies CollagePlacement;
    }

    const widthPx = widthRem * 16;
    const bottomMostPx = occupied.reduce((max, rect) => Math.max(max, rect.bottom), 0);
    const stackTopPx = bottomMostPx + 24;
    const stackLeftPx = clampNumber((index % 6) * (widthPx + 12), 0, Math.max(0, canvasWidthPx - widthPx));
    const stackRect: CollageRect = {
      left: stackLeftPx,
      top: stackTopPx,
      right: stackLeftPx + widthPx,
      bottom: stackTopPx + heightPx
    };
    occupied.push(stackRect);

    return {
      left: `${(stackLeftPx / canvasWidthPx) * 100}%`,
      top: `${(stackTopPx / canvasHeightPx) * 100}%`,
      width: `${widthRem}rem`,
      minWidth: `${widthRem}rem`
    } satisfies CollagePlacement;
  });
}

function getCollageCardWidth(
  wish: PublicWishPreview,
  layer: CollageLayer,
  exportMode = false,
  maxWidth?: string
) {
  void maxWidth;
  const contentLength = wish.message.length;
  const extra = Math.min(
    exportMode ? 12 : 10,
    Math.max(0, Math.ceil(contentLength / (layer === "featured" ? 10 : layer === "standard" ? 13 : 16)))
  );

  switch (layer) {
    case "featured":
      return `${Math.min(exportMode ? 46 : 23.4, (exportMode ? 31 : 12.4) + extra * (exportMode ? 1.9 : 0.98))}rem`;
    case "standard":
      return `${Math.min(exportMode ? 42 : 21.8, (exportMode ? 26 : 10.4) + extra * (exportMode ? 2.15 : 1.12))}rem`;
    case "mini":
      return `${Math.min(exportMode ? 17 : 8.4, (exportMode ? 10.5 : 5.4) + extra * (exportMode ? 0.75 : 0.3))}rem`;
    case "micro":
    default:
      return `${Math.min(exportMode ? 13 : 6.4, (exportMode ? 8 : 4.2) + extra * (exportMode ? 0.5 : 0.22))}rem`;
  }
}

function PosterScrapNote({
  exportMode,
  prominence = "mini",
  isCompact,
  onRemoveWish,
  removingWishId,
  rotation,
  paperTone,
  styleVariant,
  wish
}: {
  exportMode: boolean;
  prominence?: CollageLayer;
  isCompact: boolean;
  onRemoveWish?: (wishId: string) => void;
  removingWishId?: string | null;
  rotation: number;
  paperTone: string;
  styleVariant: (typeof palette)[number];
  wish: PublicWishPreview;
}) {
  const featured = prominence === "featured";
  const standard = prominence === "standard";
  const mini = prominence === "mini";

  const sizeClasses = exportMode
    ? featured
      ? "px-8 py-7"
      : standard
        ? "px-7 py-6"
        : mini
          ? "px-6 py-5"
          : "px-5 py-4"
    : isCompact
      ? "px-4 py-3.5"
      : "px-4.5 py-4";

  const senderClass = exportMode
    ? featured
      ? "text-[1.4rem] tracking-[0.26em]"
      : standard
        ? "text-[1.26rem] tracking-[0.24em]"
        : mini
          ? "text-[1.1rem] tracking-[0.22em]"
          : "text-[1rem] tracking-[0.2em]"
    : "text-[0.68rem] tracking-[0.22em]";

  const messageClass = exportMode
    ? featured
      ? "mt-3 text-[40px] leading-[1.34]"
      : standard
        ? "mt-3 text-[32px] leading-[1.32]"
        : mini
          ? "mt-2.5 text-[24px] leading-[1.3]"
          : "mt-2.5 text-[19px] leading-[1.28]"
    : "mt-2 text-[12.5px] leading-[1.4]";

  const senderColor = hexToRgba(styleVariant.accent, featured ? 0.94 : standard ? 0.88 : 0.78);
  const messageColor = hexToRgba(styleVariant.accent, featured ? 0.96 : standard ? 0.9 : 0.82);
  const displaySender = truncateText(wish.senderName, LAYER_TEXT_LIMITS[prominence].sender);
  const displayMessage = truncateText(wish.message, LAYER_TEXT_LIMITS[prominence].message);

  return (
    <article
      className={cn(
        "relative",
        exportMode ? "shadow-none" : "",
        sizeClasses,
        featured ? "font-medium" : ""
      )}
      style={{
        backgroundColor: paperTone,
        border: `${featured ? 2 : 1}px solid ${hexToRgba(styleVariant.accent, featured ? 0.58 : standard ? 0.46 : 0.34)}`,
        boxShadow: exportMode
          ? "none"
          : featured
            ? "0 16px 30px rgba(67,34,53,0.12), 0 0 0 1px rgba(255,255,255,0.62) inset"
            : standard
              ? "0 10px 22px rgba(67,34,53,0.08), 0 0 0 1px rgba(255,255,255,0.48) inset"
              : "0 6px 14px rgba(67,34,53,0.05), 0 0 0 1px rgba(255,255,255,0.38) inset",
        transform: `rotate(${rotation}deg)`,
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(128,98,68,0.025) 0 1px, transparent 1px 8px), radial-gradient(circle at top left, rgba(255,255,255,0.32), transparent 34%)"
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundColor: styleVariant.wash }}
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-2.5 w-[34%] rounded-br-[0.9rem] opacity-72"
        style={{ backgroundColor: hexToRgba(styleVariant.accent, 0.12) }}
      />

      {onRemoveWish ? (
        <button
          aria-label={`Remove ${wish.senderName}'s wish from the wall`}
          className={cn(
            "absolute right-1.5 top-1.5 z-10 inline-flex items-center justify-center rounded-full bg-white/92 text-[10px] leading-none text-plum-800 shadow-[0_4px_10px_rgba(67,34,53,0.12)] transition hover:bg-white",
            exportMode ? "h-[1.8rem] w-[1.8rem] text-[13px]" : "h-[1.125rem] w-[1.125rem]"
          )}
          disabled={removingWishId === wish.id}
          type="button"
          onClick={() => onRemoveWish(wish.id)}
        >
          ×
        </button>
      ) : null}

      <div className="relative">
        <p
          className={cn(
            featured ? "font-bold" : standard ? "font-semibold" : "font-medium",
            "uppercase",
            senderClass
          )}
          style={{ color: senderColor }}
        >
          {displaySender}
        </p>
        <p
          className={cn(
            featured ? "font-semibold" : standard ? "font-medium" : "font-normal",
            "whitespace-normal break-words [overflow-wrap:anywhere] italic",
            messageClass
          )}
          style={{
            color: messageColor,
            fontFamily: getTypographyFont("handwritten")
          }}
        >
          {displayMessage}
        </p>

        {(featured || standard || exportMode) ? (
          <div
            className={cn(
              "rounded-full",
              featured ? "mt-2.5 h-[3px] w-16" : exportMode ? "mt-3 h-[3px] w-14" : "mt-2 h-px w-7"
            )}
            style={{ backgroundColor: hexToRgba(styleVariant.accent, featured ? 0.58 : 0.4) }}
          />
        ) : null}
      </div>
    </article>
  );
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
  layoutMode,
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
  layoutMode: WishWallSettings["layout"]["mode"];
  wish: PublicWishPreview;
}) {
  const cardClassName = cn(
    "relative mb-5 break-inside-avoid border px-5 py-5 shadow-[0_24px_54px_rgba(67,34,53,0.14)]",
    radiusClasses[settings.cardStyle.radius],
    cardTone,
    settings.cardStyle.style === "glass" && !exportMode ? "backdrop-blur-xl" : "",
    exportMode ? "shadow-none" : "",
    layoutMode === "stack" ? "w-full" : "",
    layoutMode === "letterTimeline" ? "w-full max-w-[32rem]" : "",
    layoutMode === "openJournal" ? "w-full max-w-[34rem]" : "",
    layoutMode === "buntingGarland" ? "w-full max-w-[20rem]" : "",
    ""
  );

  if (layoutMode === "collageScrapbook") {
    const accentColor = styleVariant.accent;
    const compactPadClass = isCompact ? "px-3.5 py-2.5" : "px-5 py-3.5";
    const compactNameClass = isCompact ? "text-[0.42rem] tracking-[0.22em]" : "text-[0.62rem] tracking-[0.28em]";
    const compactMessageClass = isCompact ? "mt-1.25 text-[8px] leading-[1.24]" : "mt-2 text-[12.5px] leading-[1.34]";
    const compactLineClass = isCompact ? "mt-2 w-7" : "mt-3 w-14";

    return (
      <article
        className={cn(
          `relative overflow-hidden bg-[#fffdf8] ${compactPadClass} shadow-[0_16px_34px_rgba(67,34,53,0.08)]`,
          exportMode ? "shadow-none" : ""
        )}
        style={{
          border: `2px solid ${accentColor}`,
          boxShadow: "0 16px 34px rgba(67,34,53,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset",
          clipPath: "polygon(2% 1%, 96% 0%, 100% 9%, 98% 92%, 94% 100%, 6% 98%, 0 90%, 1% 9%)",
          transform: `rotate(${rotation}deg)`
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(131, 106, 74, 0.03) 0, rgba(131, 106, 74, 0.03) 1px, transparent 1px, transparent 9px)" }} />
        {(wish.senderName.toLowerCase().includes("tunde") || wish.senderName.toLowerCase().includes("james")) ? (
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-[#7b2f4c]/85"
            style={{ clipPath: "polygon(0 0, 100% 10%, 92% 100%, 0 92%)", filter: "drop-shadow(2px 0 4px rgba(67,34,53,0.12))" }}
          />
        ) : null}
        <div className="relative px-2 pt-2.5 pb-2">
          <p className={`font-semibold uppercase ${compactNameClass}`} style={{ color: accentColor }}>
            {truncateText(wish.senderName, 24)}
          </p>
          <p
            className={cn(
              "font-normal italic text-[#2f2f2f]",
              compactMessageClass
            )}
            style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
          >
            {truncateText(wish.message, isCompact ? 140 : 220)}
          </p>
          <div className={`${compactLineClass} h-px rounded-full`} style={{ backgroundColor: `${accentColor}66` }} />
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
            {truncateText(wish.senderName, 24)}
          </p>
          <p
            className={cn(
              "mt-3 text-[1rem] leading-7 text-[#2f2f2f]",
              isCompact ? "text-[0.95rem]" : "text-[1rem]"
            )}
            style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
          >
            {truncateText(wish.message, isCompact ? 140 : 220)}
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
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#a88a6b]">{wish.senderName}</p>
          <p
            className={cn(
              "mt-2 font-normal italic leading-6 text-[#2f2f2f]",
              isCompact ? "text-[13px]" : "text-[14px]"
            )}
            style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
          >
            {truncateText(wish.message, isCompact ? 140 : 220)}
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

      {onRemoveWish ? (
        <button
          aria-label={`Remove ${wish.senderName}'s wish from the wall`}
          className={cn(
            "absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/88 text-plum-800 shadow-[0_10px_22px_rgba(67,34,53,0.12)] transition hover:-translate-y-0.5 hover:bg-white",
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
            <p className="text-xl text-plum-800" style={{ fontFamily: getTypographyFont(settings.typography.headingFont) }}>
              {truncateText(wish.senderName, 24)}
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
          {truncateText(wish.message, isCompact ? 100 : 140)}
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
  coverImageUrl,
  eventDate,
  eventTitle,
  eventType,
  profileImageUrl,
  exportMode = false,
  onRemoveWish,
  removingWishId,
  settings,
  wishes
}: WishWallPreviewProps) {
  const [timelinePage, setTimelinePage] = useState(0);
  const [collagePage, setCollagePage] = useState(0);
  const [buntingPage, setBuntingPage] = useState(0);
  const [journalPage, setJournalPage] = useState(0);
  const theme = themeAccents[settings.themePreset];
  const headingFont = getTypographyFont(settings.typography.headingFont);
  const bodyFont = getTypographyFont(settings.typography.bodyFont);
  const cardTone = styleClasses[settings.cardStyle.style];
  const wallStyle = settings.layout.mode;
  const posterWallStyle = "collageScrapbook" as const;
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
  const posterBackgroundStyle =
    settings.background.mode === "solid"
      ? {
          backgroundColor: settings.background.color,
          backgroundImage:
            "radial-gradient(circle at top, rgba(255,255,255,0.24), rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%)"
        }
      : settings.background.mode === "image" && hasBackgroundImage
        ? {
            backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,250,244,0.28)), url(${settings.background.imageUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover"
          }
        : {
            backgroundImage: `linear-gradient(180deg, ${settings.background.gradientStart} 0%, ${settings.background.gradientEnd} 100%)`
          };
  const timelinePageSize = 4;
  const totalTimelinePages = Math.max(1, Math.ceil(wishes.length / timelinePageSize));
  const collagePageSize = 50;
  const totalCollagePages = Math.max(1, Math.ceil(wishes.length / collagePageSize));
  const buntingPageSize = 8;
  const totalBuntingPages = Math.max(1, Math.ceil(wishes.length / buntingPageSize));
  const journalPageSize = 8;
  const totalJournalPages = Math.max(1, Math.ceil(wishes.length / journalPageSize));
  const timelineWishes = useMemo(() => {
    if (wallStyle !== "letterTimeline") {
      return wishes;
    }

    const start = timelinePage * timelinePageSize;
    return wishes.slice(start, start + timelinePageSize);
  }, [timelinePage, timelinePageSize, wallStyle, wishes]);

  const collagePageWishes = useMemo(() => {
    if (posterWallStyle !== "collageScrapbook") {
      return wishes;
    }

    const start = collagePage * collagePageSize;
    return wishes.slice(start, start + collagePageSize);
  }, [collagePage, collagePageSize, posterWallStyle, wishes]);

  const arrangedCollageWishes = useMemo(() => {
    return [...collagePageWishes].sort((a, b) => {
      const lengthDelta = b.message.length - a.message.length;
      if (lengthDelta !== 0) {
        return lengthDelta;
      }

      return a.senderName.localeCompare(b.senderName);
    });
  }, [collagePageWishes]);

  const standardWishes = arrangedCollageWishes.slice(0, 6);
  const standardWishIds = new Set(standardWishes.map((wish) => wish.id));
  const backgroundWishes = arrangedCollageWishes.filter((wish) => !standardWishIds.has(wish.id));
  const miniWishes = backgroundWishes.slice(0, 20);
  const microWishes = backgroundWishes.slice(20);
  const collageCanvasWidthPx = COLLAGE_CANVAS_WIDTH_PX;
  const collageBaseHeightPx = exportMode ? 1800 : COLLAGE_BASE_HEIGHT_PX;
  const collageExportBottomBufferPx = exportMode ? 720 : 0;
  const collageCanvasHeightPx = useMemo(
    () =>
      computeCollageCanvasHeightPx(
        standardWishes.length,
        miniWishes.length,
        microWishes.length,
        collageBaseHeightPx
      ) + collageExportBottomBufferPx,
    [collageBaseHeightPx, collageExportBottomBufferPx, standardWishes.length, miniWishes.length, microWishes.length]
  );
  const collagePlacements = useMemo(() => {
    if (wallStyle !== "collageScrapbook") {
      return {
        micro: [] as CollagePlacement[],
        mini: [] as CollagePlacement[],
        standard: [] as CollagePlacement[]
      };
    }

    const canvasWidthPx = collageCanvasWidthPx;
    const canvasHeightPx = collageCanvasHeightPx;

    const occupied: CollageRect[] = [getCollageHeroRect(canvasWidthPx, canvasHeightPx)];

    const standard = buildCollisionSafeCollagePlacements(
      standardWishes,
      "standard",
      occupied,
      canvasWidthPx,
      canvasHeightPx,
      exportMode
    );
    const mini = buildCollisionSafeCollagePlacements(miniWishes, "mini", occupied, canvasWidthPx, canvasHeightPx, exportMode);
    const micro = buildCollisionSafeCollagePlacements(microWishes, "micro", occupied, canvasWidthPx, canvasHeightPx, exportMode);

    return { micro, mini, standard };
  }, [collageCanvasHeightPx, collageCanvasWidthPx, microWishes, miniWishes, standardWishes, wallStyle]);
  const buntingWishes = useMemo(() => {
    if (wallStyle !== "buntingGarland") {
      return wishes;
    }

    const start = buntingPage * buntingPageSize;
    return wishes.slice(start, start + buntingPageSize);
  }, [buntingPage, buntingPageSize, wallStyle, wishes]);
  const journalWishes = useMemo(() => {
    if (wallStyle !== "openJournal") {
      return wishes;
    }

    const start = journalPage * journalPageSize;
    return wishes.slice(start, start + journalPageSize);
  }, [journalPage, journalPageSize, wallStyle, wishes]);

  useEffect(() => {
    if (collagePage > totalCollagePages - 1) {
      setCollagePage(Math.max(0, totalCollagePages - 1));
    }
  }, [collagePage, totalCollagePages]);

  useEffect(() => {
    if (timelinePage > totalTimelinePages - 1) {
      setTimelinePage(Math.max(0, totalTimelinePages - 1));
    }
  }, [timelinePage, totalTimelinePages]);

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

  if (!wishes.length) {
    return (
      <section
        className={cn(
          "relative overflow-hidden rounded-[36px] border border-white/70 px-0 py-4 shadow-card sm:py-6",
          exportMode && "shadow-none"
        )}
        style={{
          ...backgroundStyle,
          fontFamily: bodyFont
        }}
      >
        <div className="flex min-h-[22rem] items-center justify-center px-5 py-8 sm:px-8">
          <div className="rounded-[30px] border border-dashed border-[#e2c29d] bg-white/62 p-8 text-center text-sm text-charcoal-900/68 shadow-[0_18px_40px_rgba(67,34,53,0.08)]">
            <p className="text-lg font-semibold text-charcoal-900">Waiting for the first memory</p>
            <p className="mt-2 text-sm leading-7 text-charcoal-900/68">
              This scrapbook will fill with torn paper notes as memories arrive.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[36px] border border-white/70 px-0 py-4 shadow-card sm:py-6",
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
                title: `- wishes for ${celebrantName} -`,
                items: journalWishes.slice(0, Math.ceil(journalWishes.length / 2))
              },
              {
                number: "- 2 -",
                title: "- continued -",
                items: journalWishes.slice(Math.ceil(journalWishes.length / 2))
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
                    page.items.map((wish, index) => (
                      <div key={wish.id} className="pb-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-charcoal-900/42">
                          {truncateText(wish.senderName, 24)}
                        </p>
                        <p
                          className="mt-2 font-normal italic text-[1rem] leading-7 text-plum-800"
                          style={{ fontFamily: getTypographyFont(settings.typography.bodyFont) }}
                        >
                          {truncateText(wish.message, isCompact ? 140 : 220)}
                        </p>
                        {index < page.items.length - 1 ? (
                          <div className="mt-4 border-b border-dashed border-[#e7cfa8]" />
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-plum-700/14 bg-white/72 p-6 text-center text-sm text-charcoal-900/60">
                      No wishes yet.
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
          {posterWallStyle === "collageScrapbook" ? (
            <div
              className={cn(
                "relative overflow-hidden rounded-[42px] border border-[#ead7c1] shadow-[0_32px_80px_rgba(67,34,53,0.12)]",
                exportMode ? "px-3 py-3 sm:px-4 sm:py-4" : "px-4 py-3 sm:px-6 sm:py-4"
              )}
              style={posterBackgroundStyle}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 12% 14%, rgba(255, 199, 226, 0.25), transparent 12%), radial-gradient(circle at 86% 12%, rgba(191, 168, 255, 0.22), transparent 11%), radial-gradient(circle at 18% 78%, rgba(255, 220, 152, 0.18), transparent 12%), radial-gradient(circle at 78% 76%, rgba(122, 186, 255, 0.18), transparent 12%)"
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_24%),radial-gradient(circle_at_top_right,rgba(255,192,203,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(110,61,88,0.08),transparent_32%)]" />
              <div
                className={cn("relative mx-auto", exportMode ? "max-w-none" : "max-w-[78rem]")}
                style={{ minHeight: `${collageCanvasHeightPx / 16}rem` }}
              >
                <div className="absolute left-1/2 top-[47%] z-20 w-[12rem] -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="mx-auto flex h-[5.8rem] w-[5.8rem] items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-[radial-gradient(circle_at_top,#fff7ea,#ebcda7)] shadow-[0_24px_44px_rgba(67,34,53,0.18)]">
                    {(profileImageUrl ?? coverImageUrl) ? (
                      <img
                        alt={`${celebrantName} profile`}
                        className="h-full w-full object-cover"
                        crossOrigin="anonymous"
                        src={profileImageUrl ?? coverImageUrl ?? ""}
                      />
                    ) : (
                      <span className="text-4xl leading-none text-[#5f324a]" style={{ fontFamily: headingFont }}>
                        {celebrantName
                          .split(" ")
                          .filter(Boolean)
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    )}
                  </div>
                  <p className="mt-3.5 text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[#6f5680]">
                    Good vibes for
                  </p>
                  <h3 className="mt-1 text-[2.45rem] leading-[0.92] text-[#6a3f7a]" style={{ fontFamily: fontFamilies.handwritten }}>
                    {celebrantName}
                  </h3>
                  <p className="mx-auto mt-2.5 max-w-[11rem] text-[0.82rem] leading-6 text-charcoal-900/72">
                    A keepsake of love and wishes.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#edd8bc] bg-white/88 px-3.5 py-1.5 text-[0.78rem] text-plum-800 shadow-[0_10px_24px_rgba(67,34,53,0.08)]">
                    <span className="text-lg leading-none">?</span>
                    <span className="font-semibold">{wishes.length} Wishes</span>
                  </div>
                </div>

                <div className="absolute left-[13%] top-[10%] text-[0.9rem] leading-5 text-[#d84e92]" style={{ fontFamily: fontFamilies.handwritten }}>
                  Keep being you
                  <span className="ml-1 text-lg">?</span>
                </div>

                {microWishes.length ? (
                  microWishes.map((wish, index) => {
                    const placement = collagePlacements.micro[index];

                    return (
                      <div
                        key={`micro-${wish.id}`}
                        className="absolute z-[0] opacity-70"
                        style={{
                          left: placement.left,
                          top: placement.top,
                          width: placement.width,
                          minWidth: placement.width
                        }}
                      >
                        <PosterScrapNote
                          exportMode={exportMode}
                          prominence="micro"
                          isCompact
                          onRemoveWish={onRemoveWish}
                          removingWishId={removingWishId}
                          rotation={getRotation(index) * 0.2}
                          paperTone={settings.background.mode === "solid"
                            ? settings.background.color
                            : settings.background.mode === "gradient"
                              ? settings.background.gradientStart
                              : "rgba(248, 241, 234, 0.88)"}
                          styleVariant={palette[index % palette.length]}
                          wish={wish}
                        />
                      </div>
                    );
                  })
                ) : null}

                {miniWishes.length ? (
                  miniWishes.map((wish, index) => {
                    const placement = collagePlacements.mini[index];

                    return (
                      <div
                        key={`mini-${wish.id}`}
                        className="absolute z-[1] opacity-90"
                        style={{
                          left: placement.left,
                          top: placement.top,
                          width: placement.width,
                          minWidth: placement.width
                        }}
                      >
                        <PosterScrapNote
                          exportMode={exportMode}
                          prominence="mini"
                          isCompact
                          onRemoveWish={onRemoveWish}
                          removingWishId={removingWishId}
                          rotation={getRotation(index) * 0.32}
                          paperTone={settings.background.mode === "solid"
                            ? settings.background.color
                            : settings.background.mode === "gradient"
                              ? settings.background.gradientStart
                              : "rgba(248, 241, 234, 0.88)"}
                          styleVariant={palette[index % palette.length]}
                          wish={wish}
                        />
                      </div>
                    );
                  })
                ) : null}

                {standardWishes.length ? (
                  standardWishes.map((wish, index) => {
                    const placement = collagePlacements.standard[index];

                    return (
                      <div
                        key={`standard-${wish.id}`}
                        className="absolute z-[5] opacity-100"
                        style={{
                          left: placement.left,
                          top: placement.top,
                          width: placement.width,
                          minWidth: placement.width
                        }}
                      >
                        <PosterScrapNote
                          exportMode={exportMode}
                          prominence="standard"
                          isCompact={settings.cardStyle.density === "compact"}
                          onRemoveWish={onRemoveWish}
                          removingWishId={removingWishId}
                          rotation={getRotation(index + 3) * 0.5}
                          paperTone={
                            settings.background.mode === "solid"
                              ? settings.background.color
                              : settings.background.mode === "gradient"
                                ? settings.background.gradientStart
                                : "rgba(248, 241, 234, 0.92)"
                          }
                          styleVariant={palette[(index + 2) % palette.length]}
                          wish={wish}
                        />
                      </div>
                    );
                  })
                ) : null}

                {collagePageWishes.length ? null : (
                  <div className="absolute inset-x-4 top-1/2 z-30 -translate-y-1/2 rounded-[30px] border border-dashed border-[#e2c29d] bg-white/72 p-8 text-center text-sm text-charcoal-900/68">
                    <p className="text-lg font-semibold text-charcoal-900">Waiting for the first wish</p>
                    <p className="mt-2">This wall will fill with wishes as they arrive.</p>
                  </div>
                )}

                <div className="pointer-events-none absolute left-[3%] top-[10%] text-2xl text-[#f2c66a]">✦</div>
                <div className="pointer-events-none absolute right-[4%] top-[14%] text-3xl text-[#c58de6]">♡</div>
                <div className="pointer-events-none absolute left-[10%] bottom-[18%] text-3xl text-[#ef8ab0]">☆</div>
                <div className="pointer-events-none absolute right-[14%] bottom-[8%] text-3xl text-[#75b6f5]">✧</div>
                <div className="pointer-events-none absolute left-[78%] top-[50%] text-4xl text-[#f39ac1]">◯</div>

                <div className="pointer-events-none absolute left-[22%] top-[22%] text-3xl text-[#f2c66a]">✦</div>
                <div className="pointer-events-none absolute right-[18%] top-[20%] text-4xl text-[#c58de6]">♡</div>
                <div className="pointer-events-none absolute left-[8%] bottom-[24%] text-4xl text-[#ef8ab0]">☆</div>
                <div className="pointer-events-none absolute right-[10%] bottom-[10%] text-4xl text-[#75b6f5]">✧</div>
                <div className="pointer-events-none absolute left-[64%] top-[58%] text-5xl text-[#f39ac1]">◯</div>
                <div className="pointer-events-none absolute left-[31%] top-[14%] text-2xl text-[#f39ac1]">❋</div>
                <div className="pointer-events-none absolute right-[31%] top-[15%] text-2xl text-[#f2c66a]">✿</div>
                <div className="pointer-events-none absolute left-[17%] bottom-[14%] text-3xl text-[#c58de6]">✦</div>
                <div className="pointer-events-none absolute right-[24%] bottom-[15%] text-3xl text-[#ef8ab0]">♡</div>
                <div className="pointer-events-none absolute left-[50%] top-[81%] text-2xl text-[#75b6f5]">✧</div>
                <div className="pointer-events-none absolute right-[8%] top-[38%] text-2xl text-[#f2c66a]">★</div>

                {!exportMode && totalCollagePages > 1 ? (
                  <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center gap-3 rounded-full border border-[#ead9c2] bg-white/86 px-4 py-2 shadow-[0_8px_18px_rgba(67,34,53,0.06)] backdrop-blur-sm">
                    <button
                      className="inline-flex h-9 items-center rounded-full border border-[#ead9c2] bg-white px-4 text-sm text-plum-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={collagePage === 0}
                      type="button"
                      onClick={() => setCollagePage((value) => Math.max(0, value - 1))}
                    >
                      Prev
                    </button>
                    <span className="text-xs uppercase tracking-[0.22em] text-charcoal-900/55">
                      Page {collagePage + 1} of {totalCollagePages}
                    </span>
                    <button
                      className="inline-flex h-9 items-center rounded-full border border-[#ead9c2] bg-white px-4 text-sm text-plum-800 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={collagePage >= totalCollagePages - 1}
                      type="button"
                      onClick={() => setCollagePage((value) => Math.min(totalCollagePages - 1, value + 1))}
                    >
                      Next
                    </button>
                  </div>
                ) : null}

              </div>
            </div>
          ) : wallStyle === "letterTimeline" ? (
            <div className="mx-auto w-[760px] max-w-none origin-top scale-[0.34] sm:scale-[0.44] md:scale-[0.56] lg:w-full lg:scale-100">
              <div className="pointer-events-none absolute left-1/2 top-2 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-[#c78f68]" />
              {timelineWishes.length ? (
                timelineWishes.map((wish, index) => {
                  const isLeft = index % 2 === 0;

                  return (
                    <div
                      key={wish.id}
                      className="relative grid w-full grid-cols-2 gap-x-12 py-5"
                    >
                      <div
                        className={cn(
                          "w-full max-w-[280px] self-center",
                          isLeft ? "col-start-1 justify-self-end" : "col-start-2 justify-self-start"
                        )}
                      >
                        <WishCard
                          cardTone={cardTone}
                          exportMode={exportMode}
                          isCompact={settings.cardStyle.density === "compact"}
                          onRemoveWish={onRemoveWish}
                          removingWishId={removingWishId}
                          rotation={0}
                          settings={settings}
                          styleVariant={palette[index % palette.length]}
                          theme={theme}
                          layoutMode={wallStyle}
                          wish={wish}
                        />
                      </div>

                      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#f0e0ca] bg-[#f8f1ea] shadow-[0_8px_18px_rgba(67,34,53,0.08)]">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#7f3650]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 rounded-[30px] border border-dashed border-plum-700/18 bg-white/70 p-8 text-center text-sm text-charcoal-900/68">
                  <p className="text-lg font-semibold text-charcoal-900">Waiting for the first wish</p>
                  <p className="mt-2">
                    The timeline is ready. As wishes arrive, they will appear here as floating letters.
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
                <span className="text-lg leading-none text-white">?</span>
              </div>
            </div>
          ) : wallStyle === "buntingGarland" ? (
            <>
              <div className="pointer-events-none absolute left-4 right-4 top-8 h-px border-t border-dashed border-plum-700/20" />
              {buntingWishes.length ? (
                buntingWishes.map((wish, index) => (
                  <div key={wish.id} className={getLayoutItemClass(settings, index)}>
                    <WishCard
                      cardTone={cardTone}
                      exportMode={exportMode}
                      isCompact={settings.cardStyle.density === "compact"}
                      onRemoveWish={onRemoveWish}
                      removingWishId={removingWishId}
                      rotation={getLayoutRotation(wallStyle, index)}
                      settings={settings}
                      styleVariant={palette[index % palette.length]}
                      theme={theme}
                      layoutMode={wallStyle}
                      wish={wish}
                    />
                  </div>
                ))
              ) : (
                <div className="rounded-[30px] border border-dashed border-plum-700/18 bg-white/70 p-8 text-center text-sm text-charcoal-900/68 lg:col-span-2">
                  <p className="text-lg font-semibold text-charcoal-900">
                    Waiting for the first memory
                  </p>
                  <p className="mt-2">
                    This scrapbook will fill with torn paper notes as memories arrive.
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
          ) : wishes.length ? (
            wishes.map((wish, index) => (
              <div key={wish.id} className={getLayoutItemClass(settings, index)}>
                <WishCard
                  cardTone={cardTone}
                  exportMode={exportMode}
                  isCompact={settings.cardStyle.density === "compact"}
                  onRemoveWish={onRemoveWish}
                  removingWishId={removingWishId}
                  rotation={getLayoutRotation(wallStyle, index)}
                  settings={settings}
                  styleVariant={palette[index % palette.length]}
                  theme={theme}
                  layoutMode={wallStyle}
                  wish={wish}
                />
              </div>
            ))
          ) : (
            <div className="rounded-[30px] border border-dashed border-plum-700/18 bg-white/70 p-8 text-center text-sm text-charcoal-900/68 lg:col-span-2">
              <p className="text-lg font-semibold text-charcoal-900">Waiting for the first memory</p>
              <p className="mt-2">
                This scrapbook will fill with torn paper notes as memories arrive.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
} 




