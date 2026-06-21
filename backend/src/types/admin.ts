export type AdminPaginationInput = {
  page: number;
  pageSize: number;
  q?: string;
};

export type AdminListMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AdminUserRecord = {
  celebrations_count: string;
  created_at: Date;
  email: string;
  id: string;
  name: string;
  role: "user" | "admin";
  total_gifts_kobo: string;
};

export type AdminEventRecord = {
  celebrant_name: string;
  created_at: Date;
  event_date: string;
  event_type: string;
  gifts_count: string;
  id: string;
  owner_email: string;
  owner_id: string;
  owner_name: string;
  slug: string;
  title: string;
  wishes_count: string;
};

export type AdminWishRecord = {
  created_at: Date;
  event_id: string;
  event_slug: string;
  event_title: string;
  id: string;
  is_hidden: boolean;
  message: string;
  sender_email: string | null;
  sender_name: string;
};

export type AdminWishDetailRecord = {
  created_at: Date;
  event_id: string;
  id: string;
  is_hidden: boolean;
  message: string;
  sender_email: string | null;
  sender_name: string;
};

export type AdminReportRecord = {
  created_at: Date;
  event_id: string | null;
  event_title: string | null;
  guestbook_entry_id: string | null;
  id: string;
  reason: string;
  status: string;
  wish_id: string | null;
  wish_message: string | null;
};

export type AdminGiftRecord = {
  amount_kobo: string;
  created_at: Date;
  event_id: string;
  event_title: string;
  id: string;
  message: string | null;
  paystack_reference: string;
  platform_fee_kobo: string;
  sender_email: string | null;
  sender_name: string;
  status: string;
  total_charged_kobo: string;
  user_email: string;
  user_id: string;
  user_name: string;
  verified_at: Date | null;
};

export type AdminMetricsRecord = {
  open_reports_count: string;
  pending_withdrawals_count: string;
  successful_gift_value_kobo: string;
  total_celebrations: string;
  total_gifts: string;
  total_users: string;
  total_wishes: string;
};
