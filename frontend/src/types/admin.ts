import type { AdminWithdrawal } from "./wallet";
import type { UserRole } from "./auth";

export type AdminPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AdminUser = {
  celebrationsCount: number;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: UserRole;
  totalGiftsKobo: number;
};

export type AdminCelebration = {
  celebrantName: string;
  createdAt: string;
  eventDate: string;
  eventType: string;
  giftsCount: number;
  id: string;
  owner: {
    email: string;
    id: string;
    name: string;
  };
  slug: string;
  title: string;
  wishesCount: number;
};

export type AdminWish = {
  createdAt: string;
  event: {
    id: string;
    slug: string;
    title: string;
  };
  id: string;
  isHidden: boolean;
  message: string;
  senderEmail: string | null;
  senderName: string;
};

export type AdminReport = {
  createdAt: string;
  event: {
    id: string;
    title: string | null;
  } | null;
  guestbookEntryId: string | null;
  id: string;
  reason: string;
  status: string;
  wish: {
    id: string;
    message: string | null;
  } | null;
};

export type AdminGift = {
  amountKobo: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
  };
  id: string;
  message: string | null;
  paystackReference: string;
  platformFeeKobo: number;
  senderEmail: string | null;
  senderName: string;
  status: string;
  totalChargedKobo: number;
  user: {
    email: string;
    id: string;
    name: string;
  };
  verifiedAt: string | null;
};

export type AdminMetrics = {
  openReportsCount: number;
  pendingWithdrawalsCount: number;
  successfulGiftValueKobo: number;
  totalCelebrations: number;
  totalGifts: number;
  totalUsers: number;
  totalWishes: number;
};

export type AdminListResponse<T> = {
  pagination: AdminPagination;
} & T;

export type AdminWithdrawalsResponse = {
  pagination: AdminPagination;
  withdrawals: AdminWithdrawal[];
};
