import { apiClient } from "@/services/api";
import type {
  DashboardOverview,
  EventGuestbookEntry,
  EventWish
} from "@/types/dashboard";

export const dashboardService = {
  getOverview() {
    return apiClient.get<{
      success: true;
      message: string;
      data: DashboardOverview;
    }>("/dashboard/overview");
  },
  getEventWishes(eventId: string) {
    return apiClient.get<{
      success: true;
      message: string;
      data: {
        event: {
          id: string;
          slug: string;
          title: string;
        };
        wishes: EventWish[];
      };
    }>(`/events/${eventId}/wishes`);
  },
  getEventGuestbook(eventId: string) {
    return apiClient.get<{
      success: true;
      message: string;
      data: {
        entries: EventGuestbookEntry[];
        event: {
          id: string;
          slug: string;
          title: string;
        };
      };
    }>(`/events/${eventId}/guestbook`);
  },
  hideGuestbookEntry(entryId: string) {
    return apiClient.patch<{
      success: true;
      message: string;
      data: {
        entry: EventGuestbookEntry | null;
      };
    }>(`/guestbook/${entryId}/hide`);
  },
  deleteGuestbookEntry(entryId: string) {
    return apiClient.delete<{ success: true; message: string; data: Record<string, never> }>(
      `/guestbook/${entryId}`
    );
  },
  hideWish(wishId: string) {
    return apiClient.patch<{
      success: true;
      message: string;
      data: {
        wish: {
          id: string;
        };
      };
    }>(`/wishes/${wishId}/hide`);
  }
};
