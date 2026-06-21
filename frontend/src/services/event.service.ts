import { apiClient } from "@/services/api";
import { appConfig } from "@/config/app";
import { ApiError } from "@/services/api";
import { getAccessToken } from "@/services/token-storage";
import type {
  CelebrationEvent,
  CreateEventInput,
  EventReactionCount,
  PublicGuestbookEntry,
  PublicCelebrationEvent,
  PublicWishWall
} from "@/types/event";
import type { PublicWishPreview } from "@/types/event";
import type { WishWallSettings } from "@/types/wish-wall";

type EventEnvelope = {
  success: true;
  message: string;
  data: {
    event: CelebrationEvent;
  };
};

type MyEventsResponse = {
  success: true;
  message: string;
  data: {
    events: CelebrationEvent[];
  };
};

type UploadImageResponse = {
  success: true;
  message: string;
  data: {
    folder: "avatars" | "events" | "covers";
    publicId: string;
    url: string;
  };
};

export const eventService = {
  createEvent(input: CreateEventInput) {
    return apiClient.post<EventEnvelope>("/events", input);
  },
  updateEvent(eventId: string, input: CreateEventInput) {
    return apiClient.patch<EventEnvelope>(`/events/${eventId}`, input);
  },
  deleteEvent(eventId: string) {
    return apiClient.delete<{ success: true; message: string; data: Record<string, never> }>(
      `/events/${eventId}`
    );
  },
  getMyEvents() {
    return apiClient.get<MyEventsResponse>("/events/my-events");
  },
  getEventById(eventId: string) {
    return apiClient.get<EventEnvelope>(`/events/${eventId}`);
  },
  getPublicEventBySlug(slug: string) {
    return apiClient.get<{
      success: true;
      message: string;
      data: {
        event: PublicCelebrationEvent;
        recentGuestbookEntries: PublicGuestbookEntry[];
        recentWishes: PublicWishPreview[];
        stats: {
          giftsCount: number;
          guestbookCount: number;
          wishesCount: number;
        };
      };
    }>(`/public/events/${slug}`);
  },
  getPublicWishWallBySlug(slug: string) {
    return apiClient.get<{
      success: true;
      message: string;
      data: PublicWishWall;
    }>(`/public/events/${slug}/wall`);
  },
  submitWish(
    slug: string,
    input: {
      message: string;
      senderEmail?: string;
      senderName: string;
    }
  ) {
    return apiClient.post<{
      success: true;
      message: string;
      data: {
        wish: PublicWishPreview;
      };
    }>(`/public/events/${slug}/wishes`, input);
  },
  submitGuestbookEntry(
    slug: string,
    input: {
      message: string;
      senderEmail?: string;
      senderName: string;
    }
  ) {
    return apiClient.post<{
      success: true;
      message: string;
      data: {
        entry: PublicGuestbookEntry;
      };
    }>(`/public/events/${slug}/guestbook`, input);
  },
  initializeGift(
    slug: string,
    input: {
      amountNaira: number;
      message?: string;
      senderEmail?: string;
      senderName: string;
    }
  ) {
    return apiClient.post<{
      success: true;
      message: string;
      data: {
        amountKobo: number;
        authorizationUrl: string;
        platformFeeKobo: number;
        reference: string;
        totalChargedKobo: number;
      };
    }>(`/public/events/${slug}/gifts/initialize`, input);
  },
  verifyPaystackPayment(reference: string) {
    return apiClient.post<{
      success: true;
      message: string;
      data: {
        giftId: string;
        status: string;
      };
    }>("/payments/paystack/verify", { reference });
  },
  getEventReactions(slug: string) {
    return apiClient.get<{
      success: true;
      message: string;
      data: {
        counts: EventReactionCount[];
      };
    }>(`/public/events/${slug}/reactions`);
  },
  submitEventReaction(
    slug: string,
    input: {
      reactionType: string;
      visitorFingerprint?: string;
    }
  ) {
    return apiClient.post<{
      success: true;
      message: string;
      data: {
        counts: EventReactionCount[];
      };
    }>(`/public/events/${slug}/reactions`, input);
  },
  submitWishReaction(
    wishId: string,
    input: {
      reactionType: string;
      visitorFingerprint?: string;
    }
  ) {
    return apiClient.post<{
      success: true;
      message: string;
      data: {
        counts: EventReactionCount[];
      };
    }>(`/public/wishes/${wishId}/reactions`, input);
  },
  uploadImage(input: {
    file: File;
    folder: "avatars" | "events" | "covers";
  }) {
    const formData = new FormData();
    formData.append("image", input.file);
    formData.append("folder", input.folder);

    return apiClient.post<UploadImageResponse>("/uploads/image", formData);
  },
  getWishWallSettings(eventId: string) {
    return apiClient.get<{
      success: true;
      message: string;
      data: {
        settings: WishWallSettings;
      };
    }>(`/events/${eventId}/wall-settings`);
  },
  updateWishWallSettings(eventId: string, settings: WishWallSettings) {
    return apiClient.patch<{
      success: true;
      message: string;
      data: {
        settings: WishWallSettings;
      };
    }>(`/events/${eventId}/wall-settings`, settings);
  },
  async downloadWishWallExport(
    eventId: string,
    format: "JPG" | "PDF" | "PNG",
    source: "guestbook" | "wishes" = "wishes"
  ) {
    const headers = new Headers();
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(
      `${appConfig.apiBaseUrl}/events/${eventId}/wall-export?format=${format}&source=${source}`,
      {
        credentials: "include",
        headers
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { errors?: string[]; message?: string }
        | null;

      throw new ApiError(
        payload?.message ?? "Request failed",
        response.status,
        payload?.errors ?? []
      );
    }

    return await response.blob();
  }
};
