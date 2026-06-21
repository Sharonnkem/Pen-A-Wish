import { withTransaction } from "../config/db.js";
import {
  createAdminLog,
  listAdminWithdrawalRequests
} from "../repositories/wallet.repository.js";
import {
  findAdminWishById,
  getAdminMetrics,
  listAdminEvents,
  listAdminGifts,
  listAdminReports,
  listAdminUsers,
  listAdminWishes
} from "../repositories/admin.repository.js";
import type { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

export const adminService = {
  async getUsers(input: {
    page: number;
    pageSize: number;
    q?: string;
    role?: "admin" | "all" | "user";
  }) {
    const result = await listAdminUsers(input);

    return {
      pagination: result.meta,
      users: result.rows.map((user) => ({
        celebrationsCount: Number(user.celebrations_count),
        createdAt: user.created_at,
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
        totalGiftsKobo: Number(user.total_gifts_kobo)
      }))
    };
  },

  async getEvents(input: {
    eventType?: string;
    page: number;
    pageSize: number;
    q?: string;
  }) {
    const result = await listAdminEvents(input);

    return {
      events: result.rows.map((event) => ({
        celebrantName: event.celebrant_name,
        createdAt: event.created_at,
        eventDate: event.event_date,
        eventType: event.event_type,
        giftsCount: Number(event.gifts_count),
        id: event.id,
        owner: {
          email: event.owner_email,
          id: event.owner_id,
          name: event.owner_name
        },
        slug: event.slug,
        title: event.title,
        wishesCount: Number(event.wishes_count)
      })),
      pagination: result.meta
    };
  },

  async getWishes(input: {
    page: number;
    pageSize: number;
    q?: string;
    visibility?: "all" | "hidden" | "visible";
  }) {
    const result = await listAdminWishes(input);

    return {
      pagination: result.meta,
      wishes: result.rows.map((wish) => ({
        createdAt: wish.created_at,
        event: {
          id: wish.event_id,
          slug: wish.event_slug,
          title: wish.event_title
        },
        id: wish.id,
        isHidden: wish.is_hidden,
        message: wish.message,
        senderEmail: wish.sender_email,
        senderName: wish.sender_name
      }))
    };
  },

  async deleteWish(wishId: string, admin: AuthUser) {
    const wish = await findAdminWishById(wishId);

    if (!wish) {
      throw new AppError("Wish not found", 404);
    }

    await withTransaction(async (client) => {
      await client.query("DELETE FROM wishes WHERE id = $1;", [wishId]);
      await createAdminLog(
        {
          action: "delete_wish",
          adminId: admin.id,
          description: `Deleted wish from ${wish.sender_name} for moderation.`,
          entityId: wishId,
          entityType: "wish"
        },
        client
      );
    });

    return {
      wish: {
        id: wish.id
      }
    };
  },

  async getReports(input: {
    page: number;
    pageSize: number;
    q?: string;
    status?: "all" | "open" | "resolved" | "reviewed";
  }) {
    const result = await listAdminReports(input);

    return {
      pagination: result.meta,
      reports: result.rows.map((report) => ({
        createdAt: report.created_at,
        event: report.event_id
          ? {
              id: report.event_id,
              title: report.event_title
            }
          : null,
        guestbookEntryId: report.guestbook_entry_id,
        id: report.id,
        reason: report.reason,
        status: report.status,
        wish: report.wish_id
          ? {
              id: report.wish_id,
              message: report.wish_message
            }
          : null
      }))
    };
  },

  async getGifts(input: {
    page: number;
    pageSize: number;
    q?: string;
    status?: "all" | "failed" | "pending" | "success";
  }) {
    const result = await listAdminGifts(input);

    return {
      gifts: result.rows.map((gift) => ({
        amountKobo: Number(gift.amount_kobo),
        createdAt: gift.created_at,
        event: {
          id: gift.event_id,
          title: gift.event_title
        },
        id: gift.id,
        message: gift.message,
        paystackReference: gift.paystack_reference,
        platformFeeKobo: Number(gift.platform_fee_kobo),
        senderEmail: gift.sender_email,
        senderName: gift.sender_name,
        status: gift.status,
        totalChargedKobo: Number(gift.total_charged_kobo),
        user: {
          email: gift.user_email,
          id: gift.user_id,
          name: gift.user_name
        },
        verifiedAt: gift.verified_at
      })),
      pagination: result.meta
    };
  },

  async getWithdrawals(input: {
    page: number;
    pageSize: number;
    q?: string;
    status?: "all" | "approved" | "cancelled" | "paid" | "pending" | "rejected";
  }) {
    const all = await listAdminWithdrawalRequests();

    const filtered = all.filter((withdrawal) => {
      const matchesStatus = !input.status || input.status === "all" || withdrawal.status === input.status;
      const haystack = [
        withdrawal.user_name,
        withdrawal.user_email,
        withdrawal.bank_name,
        withdrawal.account_number,
        withdrawal.account_name ?? "",
        withdrawal.admin_note ?? ""
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !input.q || haystack.includes(input.q.toLowerCase());

      return matchesStatus && matchesSearch;
    });

    const start = (input.page - 1) * input.pageSize;
    const pageRows = filtered.slice(start, start + input.pageSize);

    return {
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        totalItems: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / input.pageSize))
      },
      withdrawals: pageRows.map((withdrawal) => ({
        accountName: withdrawal.account_name,
        accountNumber: withdrawal.account_number,
        adminNote: withdrawal.admin_note,
        amountKobo: Number(withdrawal.amount_kobo),
        bankName: withdrawal.bank_name,
        createdAt: withdrawal.created_at,
        id: withdrawal.id,
        reviewedAt: withdrawal.reviewed_at,
        reviewerEmail: withdrawal.reviewer_email,
        reviewerName: withdrawal.reviewer_name,
        status: withdrawal.status,
        user: {
          email: withdrawal.user_email,
          id: withdrawal.user_id,
          name: withdrawal.user_name
        }
      }))
    };
  },

  async getMetrics() {
    const metrics = await getAdminMetrics();

    return {
      metrics: {
        openReportsCount: Number(metrics.open_reports_count),
        pendingWithdrawalsCount: Number(metrics.pending_withdrawals_count),
        successfulGiftValueKobo: Number(metrics.successful_gift_value_kobo),
        totalCelebrations: Number(metrics.total_celebrations),
        totalGifts: Number(metrics.total_gifts),
        totalUsers: Number(metrics.total_users),
        totalWishes: Number(metrics.total_wishes)
      }
    };
  }
};
