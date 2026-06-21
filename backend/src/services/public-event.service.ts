import {
  createReactionForEvent,
  createReactionForWish,
  createWishForEvent,
  findVisiblePublicWishById,
  getReactionCountsForEvent,
  getReactionCountsForWish,
  getRecentReactionForVisitor,
  getRecentWishReactionForVisitor
} from "../repositories/public-event.repository.js";
import { findEventBySlug } from "../repositories/event.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import { publicSubmissionRateLimit } from "../utils/public-submission-rate-limit.js";
import { sanitizePlainText } from "../utils/sanitize.js";
import { emailService } from "./email.service.js";

export const publicEventService = {
  async submitWish(
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

    const rateLimitKey = `wish:${event.id}:${input.ipHash ?? "unknown"}`;
    const rateLimitStatus = publicSubmissionRateLimit.check(rateLimitKey);

    if (rateLimitStatus.isLimited) {
      const retryMinutes = Math.max(1, Math.ceil(rateLimitStatus.remainingMs / 60000));

      throw new AppError(
        `Too many wishes from this device. Please try again in about ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
        429
      );
    }

    const sanitizedSenderName = sanitizePlainText(input.senderName);
    const sanitizedMessage = sanitizePlainText(input.message);

    if (sanitizedSenderName.length < 2) {
      throw new AppError("Sender name must contain at least 2 valid characters", 400);
    }

    if (!sanitizedMessage) {
      throw new AppError("Wish message cannot be empty after sanitization", 400);
    }

    const wish = await createWishForEvent({
      eventId: event.id,
      message: sanitizedMessage,
      senderEmail: input.senderEmail,
      senderName: sanitizedSenderName
    });
    publicSubmissionRateLimit.record(rateLimitKey);

    const owner = await findUserById(event.user_id);

    if (owner) {
      try {
        await emailService.sendNewWishNotification({
          celebrantName: event.celebrant_name,
          eventType: event.event_type,
          ownerEmail: owner.email,
          senderName: sanitizedSenderName
        });
      } catch (error) {
        console.error("Unable to send new wish notification", {
          error,
          eventId: event.id,
          ownerEmail: owner.email
        });
      }
    }

    return wish;
  },

  async submitEventReaction(
    slug: string,
    input: {
      ipHash?: string | null;
      reactionType: string;
      visitorFingerprint?: string;
    }
  ) {
    const event = await findEventBySlug(slug);

    if (!event || !event.is_public) {
      throw new AppError("Celebration not found", 404);
    }

    const recentReaction = await getRecentReactionForVisitor({
      eventId: event.id,
      ipHash: input.ipHash,
      reactionType: input.reactionType,
      visitorFingerprint: input.visitorFingerprint
    });

    if (!recentReaction) {
      await createReactionForEvent({
        eventId: event.id,
        ipHash: input.ipHash,
        reactionType: input.reactionType,
        visitorFingerprint: input.visitorFingerprint
      });
    }

    const counts = await getReactionCountsForEvent(event.id);

    return counts.map((count) => ({
      count: Number(count.reaction_count),
      reactionType: count.reaction_type
    }));
  },

  async submitWishReaction(
    wishId: string,
    input: {
      ipHash?: string | null;
      reactionType: string;
      visitorFingerprint?: string;
    }
  ) {
    const wish = await findVisiblePublicWishById(wishId);

    if (!wish) {
      throw new AppError("Wish not found", 404);
    }

    const recentReaction = await getRecentWishReactionForVisitor({
      ipHash: input.ipHash,
      reactionType: input.reactionType,
      visitorFingerprint: input.visitorFingerprint,
      wishId
    });

    if (!recentReaction) {
      await createReactionForWish({
        ipHash: input.ipHash,
        reactionType: input.reactionType,
        visitorFingerprint: input.visitorFingerprint,
        wishId
      });
    }

    const counts = await getReactionCountsForWish(wishId);

    return counts.map((count) => ({
      count: Number(count.reaction_count),
      reactionType: count.reaction_type
    }));
  },

  async getEventReactionCounts(slug: string) {
    const event = await findEventBySlug(slug);

    if (!event || !event.is_public) {
      throw new AppError("Celebration not found", 404);
    }

    const counts = await getReactionCountsForEvent(event.id);

    return counts.map((count) => ({
      count: Number(count.reaction_count),
      reactionType: count.reaction_type
    }));
  }
};
