import { chromium } from "playwright";

import { env } from "../config/env.js";
import { getReactionCountsForWishIds, getVisibleWishWallEntriesByEventId } from "../repositories/public-event.repository.js";
import { guestbookService } from "./guestbook.service.js";
import { eventService } from "./event.service.js";
import { wishWallService } from "./wish-wall.service.js";
import type { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";
import { ensurePlaywrightChromium } from "../utils/ensure-playwright-chromium.js";

export type WishWallExportFormat = "JPG" | "PDF" | "PNG";
export type WishWallExportSource = "guestbook" | "wishes";

type WishWallExportPayload = {
  source: WishWallExportSource;
  event: {
    celebrantName: string;
    coverImageUrl: string | null;
    eventDate: string;
    eventType: string;
    profileImageUrl: string | null;
    title: string;
  };
  settings?: Awaited<ReturnType<typeof wishWallService.getSettings>>;
  wishes?: Array<{
    createdAt: string;
    id: string;
    message: string;
    reactionCounts: Array<{ count: number; reactionType: string }>;
    senderName: string;
  }>;
  guestbookEntries?: Array<{
    createdAt: string;
    id: string;
    message: string;
    senderName: string;
  }>;
};

function encodePayload(payload: WishWallExportPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function getExportFileName(title: string, format: WishWallExportFormat) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safe || "wish-wall"}-${format.toLowerCase()}`;
}

export const wishWallExportService = {
  async exportWishWall(
    eventId: string,
    format: WishWallExportFormat,
    user: AuthUser,
    source: WishWallExportSource,
    frontendUrl?: string
  ) {
    const event = await eventService.getEventForOwner(eventId, user);
    const baseEvent = {
      celebrantName: event.celebrantName,
      coverImageUrl: event.coverImageUrl,
      eventDate: event.eventDate,
      eventType: event.eventType,
      profileImageUrl: event.profileImageUrl,
      title: event.title
    };
    let payload: WishWallExportPayload;

    if (source === "guestbook") {
      const guestbookEntries = await guestbookService.getEntriesForOwner(eventId, user);
      const settings = await wishWallService.getSettings(eventId, user);

      payload = {
        event: baseEvent,
        settings,
        guestbookEntries: guestbookEntries.entries
          .filter((entry) => !entry.isHidden)
          .map((entry) => ({
            createdAt:
              entry.createdAt instanceof Date ? entry.createdAt.toISOString() : String(entry.createdAt),
            id: entry.id,
            message: entry.message,
            senderName: entry.senderName
          })),
        source
      };
    } else {
      const settings = await wishWallService.getSettings(eventId, user);
      const wishes = await getVisibleWishWallEntriesByEventId(eventId);
      const reactionCounts = await getReactionCountsForWishIds(wishes.map((wish) => wish.id));
      const reactionMap = new Map<string, Array<{ count: number; reactionType: string }>>();

      for (const count of reactionCounts) {
        const current = reactionMap.get(count.wish_id) ?? [];
        current.push({
          count: Number(count.reaction_count),
          reactionType: count.reaction_type
        });
        reactionMap.set(count.wish_id, current);
      }

      payload = {
        event: baseEvent,
        settings,
        source,
        wishes: wishes.map((wish) => ({
          createdAt:
            wish.created_at instanceof Date ? wish.created_at.toISOString() : String(wish.created_at),
          id: wish.id,
          message: wish.message,
          reactionCounts: reactionMap.get(wish.id) ?? [],
          senderName: wish.sender_name
        }))
      };
    }

    ensurePlaywrightChromium();

    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    try {
      const page = await browser.newPage({
        deviceScaleFactor: 2,
        viewport: {
          height: 2200,
          width: 1920
        }
      });

      const exportUrl = new URL("/exports/wish-wall", frontendUrl ?? env.frontendUrl);
      exportUrl.searchParams.set("payload", encodePayload(payload));

      await page.goto(exportUrl.toString(), { waitUntil: "networkidle" });

      const wall = page.locator("[data-export-wall]");
      await wall.waitFor({ state: "visible" });

      const box = await wall.boundingBox();

      if (!box) {
        throw new AppError("Unable to render the Wish Wall export", 500);
      }

      const width = Math.ceil(box.width);
      const height = Math.ceil(box.height);

      await page.setViewportSize({
        height: Math.max(900, height),
        width: Math.max(1200, width)
      });
      await page.emulateMedia({ media: "screen" });

      if (format === "PDF") {
        return {
          buffer: await page.pdf({
            height: `${height}px`,
            margin: {
              bottom: "0",
              left: "0",
              right: "0",
              top: "0"
            },
            pageRanges: "1",
            printBackground: true,
            preferCSSPageSize: true,
            width: `${width}px`
          }),
          contentType: "application/pdf",
          fileName: getExportFileName(event.title, format)
        };
      }

      const screenshotBuffer = await wall.screenshot({
        quality: format === "JPG" ? 94 : undefined,
        type: format === "JPG" ? "jpeg" : "png"
      });

      return {
        buffer: screenshotBuffer,
        contentType: format === "JPG" ? "image/jpeg" : "image/png",
        fileName: getExportFileName(event.title, format)
      };
    } finally {
      await browser.close();
    }
  }
};
