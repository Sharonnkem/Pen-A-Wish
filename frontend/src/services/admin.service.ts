import { apiClient } from "./api";
import type {
  AdminCelebration,
  AdminGift,
  AdminListResponse,
  AdminMetrics,
  AdminReport,
  AdminUser,
  AdminWish,
  AdminWithdrawalsResponse
} from "../types/admin";

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const adminService = {
  getMetrics() {
    return apiClient.get<{
      success: true;
      message: string;
      data: {
        metrics: AdminMetrics;
      };
    }>("/admin/metrics");
  },
  getUsers(input: {
    page: number;
    pageSize: number;
    q?: string;
    role?: "all" | "admin" | "user";
  }) {
    return apiClient.get<{
      success: true;
      message: string;
      data: AdminListResponse<{
        users: AdminUser[];
      }>;
    }>(`/admin/users${buildQuery(input)}`);
  },
  getCelebrations(input: {
    eventType?: string;
    page: number;
    pageSize: number;
    q?: string;
  }) {
    return apiClient.get<{
      success: true;
      message: string;
      data: AdminListResponse<{
        events: AdminCelebration[];
      }>;
    }>(`/admin/events${buildQuery(input)}`);
  },
  getWishes(input: {
    page: number;
    pageSize: number;
    q?: string;
    visibility?: "all" | "hidden" | "visible";
  }) {
    return apiClient.get<{
      success: true;
      message: string;
      data: AdminListResponse<{
        wishes: AdminWish[];
      }>;
    }>(`/admin/wishes${buildQuery(input)}`);
  },
  deleteWish(wishId: string) {
    return apiClient.delete<{
      success: true;
      message: string;
      data: {
        wish: {
          id: string;
        };
      };
    }>(`/admin/wishes/${wishId}`);
  },
  getReports(input: {
    page: number;
    pageSize: number;
    q?: string;
    status?: "all" | "open" | "reviewed" | "resolved";
  }) {
    return apiClient.get<{
      success: true;
      message: string;
      data: AdminListResponse<{
        reports: AdminReport[];
      }>;
    }>(`/admin/reports${buildQuery(input)}`);
  },
  getGifts(input: {
    page: number;
    pageSize: number;
    q?: string;
    status?: "all" | "pending" | "success" | "failed";
  }) {
    return apiClient.get<{
      success: true;
      message: string;
      data: AdminListResponse<{
        gifts: AdminGift[];
      }>;
    }>(`/admin/gifts${buildQuery(input)}`);
  },
  getWithdrawals(input: {
    page: number;
    pageSize: number;
    q?: string;
    status?: "all" | "pending" | "approved" | "rejected" | "paid" | "cancelled";
  }) {
    return apiClient.get<{
      success: true;
      message: string;
      data: AdminWithdrawalsResponse;
    }>(`/admin/withdrawals${buildQuery(input)}`);
  }
};
