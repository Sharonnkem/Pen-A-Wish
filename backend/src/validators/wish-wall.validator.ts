import { z } from "zod";

const colorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const backgroundSchema = z.object({
  color: z.string().regex(colorPattern, "Background color must be a valid hex color"),
  gradientEnd: z.string().regex(colorPattern, "Gradient end must be a valid hex color"),
  gradientStart: z.string().regex(colorPattern, "Gradient start must be a valid hex color"),
  imageUrl: z.string().url().nullable(),
  mode: z.enum(["solid", "gradient", "image"])
});

const cardSchema = z.object({
  density: z.enum(["compact", "relaxed"]),
  radius: z.enum(["large", "rounded", "soft"]),
  style: z.enum(["linen", "glass", "polaroid"])
});

const exportSchema = z.object({
  showHeader: z.boolean(),
  showMetadata: z.boolean(),
  showReactions: z.boolean(),
  showStats: z.boolean()
});

const layoutSchema = z.object({
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  mode: z.enum([
    "collageScrapbook",
    "letterTimeline",
    "buntingGarland",
    "openJournal",
    "masonry",
    "grid",
    "stack"
  ])
});

const typographySchema = z.object({
  bodyFont: z.enum(["serif", "sans", "mono", "display", "handwritten"]),
  headingFont: z.enum(["serif", "sans", "mono", "display", "handwritten"])
});

export const wishWallSettingsSchema = z.object({
  background: backgroundSchema,
  cardStyle: cardSchema,
  export: exportSchema,
  featuredWishIds: z.array(z.string()).default([]),
  layout: layoutSchema,
  themePreset: z.enum(["paper", "sunset", "garden", "midnight"]),
  typography: typographySchema
});
