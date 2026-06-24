import { findEventById } from "../repositories/event.repository.js";
import {
  findWishWallSettingsByEventId,
  upsertWishWallSettings
} from "../repositories/wish-wall.repository.js";
import type { AuthUser } from "../types/auth.js";
import type {
  WishWallSettings,
  WishWallSettingsRecord
} from "../types/wish-wall.js";
import { AppError } from "../utils/app-error.js";

export const defaultWishWallSettings: WishWallSettings = {
  background: {
    color: "#fffaf4",
    gradientEnd: "#f8eee4",
    gradientStart: "#fffaf4",
    imageUrl: null,
    mode: "gradient"
  },
  cardStyle: {
    density: "relaxed",
    radius: "large",
    style: "polaroid"
  },
  export: {
    showHeader: true,
    showMetadata: true,
    showReactions: true,
    showStats: true
  },
  layout: {
    columns: 3,
    mode: "collageScrapbook"
  },
  themePreset: "paper",
  typography: {
    bodyFont: "sans",
    headingFont: "serif"
  }
};

function normalizeSettings(settings: WishWallSettings): WishWallSettings {
  return {
    ...settings,
    background: {
      ...settings.background,
      imageUrl: settings.background.imageUrl?.trim() || null
    }
  };
}

function assertEventOwnership(event: {
  user_id: string;
} | null,
user: AuthUser) {
  if (!event) {
    throw new AppError("Celebration not found", 404);
  }

  if (event.user_id !== user.id && user.role !== "admin") {
    throw new AppError("You do not have access to this celebration", 403);
  }
}

function mapSettings(record: WishWallSettingsRecord | null): WishWallSettings {
  return record?.settings ?? defaultWishWallSettings;
}

export const wishWallService = {
  async getSettings(eventId: string, user: AuthUser) {
    const event = await findEventById(eventId);
    assertEventOwnership(event, user);

    const record = await findWishWallSettingsByEventId(eventId);
    return mapSettings(record);
  },

  async updateSettings(
    eventId: string,
    user: AuthUser,
    settings: WishWallSettings
  ) {
    const event = await findEventById(eventId);
    assertEventOwnership(event, user);

    const normalized = normalizeSettings(settings);
    const record = await upsertWishWallSettings(eventId, normalized);

    return mapSettings(record);
  }
};
