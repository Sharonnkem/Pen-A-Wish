import {
  createEvent as createEventRecord,
  deleteEvent as deleteEventRecord,
  findEventById,
  findEventBySlug,
  getMyEvents as getMyEventRecords,
  getPublicEventStats,
  slugExists,
  updateEvent as updateEventRecord
} from "../repositories/event.repository.js";
import {
  getRecentVisibleGuestbookEntriesByEventId,
  getReactionCountsForWishIds,
  getRecentVisibleWishesByEventId,
  getVisibleWishWallEntriesByEventId
} from "../repositories/public-event.repository.js";
import type { AuthUser } from "../types/auth.js";
import type { EventRecord } from "../types/event.js";
import { AppError } from "../utils/app-error.js";
import { slugify } from "../utils/slug.js";

function mapEvent(event: EventRecord) {
  return {
    celebrantName: event.celebrant_name,
    coverImageUrl: event.cover_image_url,
    createdAt: event.created_at,
    description: event.description,
    eventDate: event.event_date,
    eventType: event.event_type,
    id: event.id,
    isPublic: event.is_public,
    profileImageUrl: event.profile_image_url,
    showPublicRecentGuestbook: event.show_public_recent_guestbook,
    showPublicRecentWishes: event.show_public_recent_wishes,
    shareLink: `/events/${event.slug}`,
    slug: event.slug,
    title: event.title,
    updatedAt: event.updated_at,
    userId: event.user_id
  };
}

async function generateUniqueSlug(input: {
  celebrantName: string;
  eventDate: string;
  eventType: string;
}) {
  const year = new Date(input.eventDate).getUTCFullYear();
  const baseSlug = slugify(`${input.celebrantName}-${input.eventType}-${year}`);

  let candidate = baseSlug || `celebration-${year}`;
  let counter = 2;

  while (await slugExists(candidate)) {
    candidate = `${baseSlug || `celebration-${year}`}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export const eventService = {
  async createEvent(
    user: AuthUser,
    input: {
      celebrantName: string;
      coverImageUrl?: string | null;
      description?: string | null;
      eventDate: string;
      eventType: string;
      profileImageUrl?: string | null;
      showPublicRecentGuestbook?: boolean;
      showPublicRecentWishes?: boolean;
      title: string;
    }
  ) {
    const slug = await generateUniqueSlug(input);
    const event = await createEventRecord({
      ...input,
      slug,
      userId: user.id
    });

    return mapEvent(event);
  },

  async getMyEvents(user: AuthUser) {
    const events = await getMyEventRecords(user.id);

    return events.map((event) => ({
      ...mapEvent(event),
      giftsCount: Number(event.gifts_count),
      wishesCount: Number(event.wishes_count)
    }));
  },

  async getEventForOwner(eventId: string, user: AuthUser) {
    const event = await findEventById(eventId);

    if (!event) {
      throw new AppError("Celebration not found", 404);
    }

    if (event.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to this celebration", 403);
    }

    return mapEvent(event);
  },

  async updateEvent(
    eventId: string,
    user: AuthUser,
    input: {
      celebrantName: string;
      coverImageUrl?: string | null;
      description?: string | null;
      eventDate: string;
      eventType: string;
      profileImageUrl?: string | null;
      showPublicRecentGuestbook?: boolean;
      showPublicRecentWishes?: boolean;
      title: string;
    }
  ) {
    const existing = await findEventById(eventId);

    if (!existing) {
      throw new AppError("Celebration not found", 404);
    }

    if (existing.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to this celebration", 403);
    }

    const updated = await updateEventRecord(eventId, input);

    if (!updated) {
      throw new AppError("Unable to update celebration", 500);
    }

    return mapEvent(updated);
  },

  async deleteEvent(eventId: string, user: AuthUser) {
    const existing = await findEventById(eventId);

    if (!existing) {
      throw new AppError("Celebration not found", 404);
    }

    if (existing.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to this celebration", 403);
    }

    await deleteEventRecord(eventId);
  },

  async getPublicEventBySlug(slug: string) {
    const event = await findEventBySlug(slug);

    if (!event || !event.is_public) {
      throw new AppError("Celebration not found", 404);
    }

    const stats = await getPublicEventStats(event.id);
    const [recentGuestbookEntries, recentWishes] = await Promise.all([
      getRecentVisibleGuestbookEntriesByEventId(event.id, 20),
      getRecentVisibleWishesByEventId(event.id, 20)
    ]);
    const wishReactionCounts = await getReactionCountsForWishIds(
      recentWishes.map((wish) => wish.id)
    );
    const wishReactionMap = new Map<string, Array<{ count: number; reactionType: string }>>();

    for (const count of wishReactionCounts) {
      const current = wishReactionMap.get(count.wish_id) ?? [];
      current.push({
        count: Number(count.reaction_count),
        reactionType: count.reaction_type
      });
      wishReactionMap.set(count.wish_id, current);
    }

    return {
      event: {
        celebrantName: event.celebrant_name,
        coverImageUrl: event.cover_image_url,
        description: event.description,
        eventDate: event.event_date,
        eventType: event.event_type,
        id: event.id,
        profileImageUrl: event.profile_image_url,
        showPublicRecentGuestbook: event.show_public_recent_guestbook,
        showPublicRecentWishes: event.show_public_recent_wishes,
        slug: event.slug,
        title: event.title
      },
      stats: {
        giftsCount: Number(stats.gifts_count),
        guestbookCount: Number(stats.guestbook_count),
        wishesCount: Number(stats.wishes_count)
      },
      recentWishes: recentWishes.map((wish) => ({
        createdAt: wish.created_at,
        id: wish.id,
        message: wish.message,
        reactionCounts: wishReactionMap.get(wish.id) ?? [],
        senderName: wish.sender_name
      })),
      recentGuestbookEntries: recentGuestbookEntries.map((entry) => ({
        createdAt: entry.created_at,
        id: entry.id,
        message: entry.message,
        senderName: entry.sender_name
      }))
    };
  },

  async getPublicWishWallBySlug(slug: string) {
    const event = await findEventBySlug(slug);

    if (!event || !event.is_public) {
      throw new AppError("Celebration not found", 404);
    }

    const [stats, wishes] = await Promise.all([
      getPublicEventStats(event.id),
      getVisibleWishWallEntriesByEventId(event.id)
    ]);
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

    return {
      event: {
        celebrantName: event.celebrant_name,
        coverImageUrl: event.cover_image_url,
        description: event.description,
        eventDate: event.event_date,
        eventType: event.event_type,
        id: event.id,
        profileImageUrl: event.profile_image_url,
        showPublicRecentGuestbook: event.show_public_recent_guestbook,
        showPublicRecentWishes: event.show_public_recent_wishes,
        slug: event.slug,
        title: event.title
      },
      stats: {
        giftsCount: Number(stats.gifts_count),
        guestbookCount: Number(stats.guestbook_count),
        wishesCount: Number(stats.wishes_count)
      },
      wishes: wishes.map((wish) => ({
        createdAt: wish.created_at,
        id: wish.id,
        message: wish.message,
        reactionCounts: reactionMap.get(wish.id) ?? [],
        senderName: wish.sender_name
      }))
    };
  }
};
