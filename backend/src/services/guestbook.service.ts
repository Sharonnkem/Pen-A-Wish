import { findEventById, findEventBySlug } from "../repositories/event.repository.js";
import {
  deleteGuestbookEntry,
  findGuestbookEntryById,
  getEventGuestbookEntriesForOwner,
  hideGuestbookEntry
} from "../repositories/guestbook.repository.js";
import { createGuestbookEntryForEvent } from "../repositories/public-event.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import type { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";
import { publicSubmissionRateLimit } from "../utils/public-submission-rate-limit.js";
import { sanitizePlainText } from "../utils/sanitize.js";
import { emailService } from "./email.service.js";

export const guestbookService = {
  async submitEntry(
    slug: string,
    input: {
      ipHash?: string | null;
      message: string;
      senderEmail?: string;
      senderName: string;
    }
  ) {
    const event = await findEventBySlug(slug);

    if (!event || !event.is_public) {
      throw new AppError("Celebration not found", 404);
    }

    const rateLimitKey = `guestbook:${event.id}:${input.ipHash ?? "unknown"}`;
    const rateLimitStatus = publicSubmissionRateLimit.check(rateLimitKey);

    if (rateLimitStatus.isLimited) {
      const retryMinutes = Math.max(1, Math.ceil(rateLimitStatus.remainingMs / 60000));

      throw new AppError(
        `Too many memory submissions from this device. Please try again in about ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
        429
      );
    }

    const sanitizedSenderName = sanitizePlainText(input.senderName);
    const sanitizedMessage = sanitizePlainText(input.message);

    if (sanitizedSenderName.length < 2) {
      throw new AppError("Sender name must contain at least 2 valid characters", 400);
    }

    if (sanitizedMessage.length < 12) {
      throw new AppError("Guestbook memory must be at least 12 characters long", 400);
    }

    const entry = await createGuestbookEntryForEvent({
      eventId: event.id,
      message: sanitizedMessage,
      senderEmail: input.senderEmail,
      senderName: sanitizedSenderName
    });
    publicSubmissionRateLimit.record(rateLimitKey);

    const owner = await findUserById(event.user_id);

    if (owner) {
      try {
        await emailService.sendGuestbookEntryNotification({
          celebrantName: event.celebrant_name,
          ownerEmail: owner.email,
          senderName: sanitizedSenderName
        });
      } catch (error) {
        console.error("Unable to send guestbook notification", {
          error,
          eventId: event.id,
          ownerEmail: owner.email
        });
      }
    }

    return entry;
  },

  async getEntriesForOwner(eventId: string, user: AuthUser) {
    const event = await findEventById(eventId);

    if (!event) {
      throw new AppError("Celebration not found", 404);
    }

    if (event.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to this celebration", 403);
    }

    const entries = await getEventGuestbookEntriesForOwner(eventId);

    return {
      entries: entries.map((entry) => ({
        createdAt: entry.created_at,
        id: entry.id,
        isHidden: entry.is_hidden,
        message: entry.message,
        senderEmail: entry.sender_email,
        senderName: entry.sender_name
      })),
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title
      }
    };
  },

  async hideEntry(entryId: string, user: AuthUser) {
    const entry = await findGuestbookEntryById(entryId);

    if (!entry) {
      throw new AppError("Guestbook entry not found", 404);
    }

    const event = await findEventById(entry.event_id);

    if (!event) {
      throw new AppError("Celebration not found", 404);
    }

    if (event.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to moderate this guestbook", 403);
    }

    return hideGuestbookEntry(entryId);
  },

  async deleteEntry(entryId: string, user: AuthUser) {
    const entry = await findGuestbookEntryById(entryId);

    if (!entry) {
      throw new AppError("Guestbook entry not found", 404);
    }

    const event = await findEventById(entry.event_id);

    if (!event) {
      throw new AppError("Celebration not found", 404);
    }

    if (event.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to moderate this guestbook", 403);
    }

    await deleteGuestbookEntry(entryId);
  }
};
