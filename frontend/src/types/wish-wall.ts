export type WishWallBackgroundMode = "solid" | "gradient" | "image";
export type WishWallCardStyle = "linen" | "glass" | "polaroid";
export type WishWallLayoutMode =
  | "collageScrapbook"
  | "letterTimeline"
  | "buntingGarland"
  | "openJournal"
  | "masonry"
  | "grid"
  | "stack";
export type WishWallThemePreset = "paper" | "sunset" | "garden" | "midnight";
export type WishWallTypographyKey = "serif" | "sans" | "mono" | "display" | "handwritten";

export type WishWallTypographySettings = {
  bodyFont: WishWallTypographyKey;
  headingFont: WishWallTypographyKey;
};

export type WishWallBackgroundSettings = {
  color: string;
  gradientEnd: string;
  gradientStart: string;
  imageUrl: string | null;
  mode: WishWallBackgroundMode;
};

export type WishWallCardSettings = {
  density: "compact" | "relaxed";
  radius: "large" | "rounded" | "soft";
  style: WishWallCardStyle;
};

export type WishWallLayoutSettings = {
  columns: 2 | 3 | 4;
  mode: WishWallLayoutMode;
};

export type WishWallExportSettings = {
  showHeader: boolean;
  showMetadata: boolean;
  showReactions: boolean;
  showStats: boolean;
};

export type WishWallSettings = {
  background: WishWallBackgroundSettings;
  cardStyle: WishWallCardSettings;
  export: WishWallExportSettings;
  featuredWishIds: string[];
  layout: WishWallLayoutSettings;
  themePreset: WishWallThemePreset;
  typography: WishWallTypographySettings;
};
