import {
  getDashboardOverview,
  getEventWishesForOwner,
  hideWishForOwner
} from "../repositories/dashboard.repository.js";
import { findEventById } from "../repositories/event.repository.js";
import { findAdminWishById } from "../repositories/admin.repository.js";
import { getEventGuestbookEntriesForOwner } from "../repositories/guestbook.repository.js";
import type { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

export const dashboardService = {
  async getOverview(user: AuthUser) {
    return getDashboardOverview(user.id);
  },

  async getEventWishes(eventId: string, user: AuthUser) {
    const event = await findEventById(eventId);

    if (!event) {
      throw new AppError("Celebration not found", 404);
    }

    if (event.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to this celebration", 403);
    }

    const wishes = await getEventWishesForOwner(eventId);

    return {
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title
      },
      wishes: wishes.map((wish) => ({
        createdAt: wish.created_at,
        id: wish.id,
        isHidden: wish.is_hidden,
        message: wish.message,
        senderEmail: wish.sender_email,
        senderName: wish.sender_name
      }))
    };
  },

  async getEventGuestbook(eventId: string, user: AuthUser) {
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

  async hideEventWish(wishId: string, user: AuthUser) {
    const wish = await findAdminWishById(wishId);

    if (!wish) {
      throw new AppError("Wish not found", 404);
    }

    const event = await findEventById(wish.event_id);

    if (!event) {
      throw new AppError("Celebration not found", 404);
    }

    if (event.user_id !== user.id && user.role !== "admin") {
      throw new AppError("You do not have access to this celebration", 403);
    }

    const hiddenWish = await hideWishForOwner(wishId);

    if (!hiddenWish) {
      throw new AppError("Unable to hide wish", 500);
    }

    return {
      wish: {
        id: hiddenWish.id
      }
    };
  }
};
