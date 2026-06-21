import { z } from "zod";

const coercePositiveInteger = z.coerce.number().int().min(1);

export const adminListQuerySchema = z.object({
  page: coercePositiveInteger.default(1),
  pageSize: coercePositiveInteger.max(50).default(12),
  q: z.string().trim().max(200).optional()
});

export const adminUsersQuerySchema = adminListQuerySchema.extend({
  role: z.enum(["all", "user", "admin"]).default("all")
});

export const adminEventsQuerySchema = adminListQuerySchema.extend({
  eventType: z.string().trim().max(80).optional().or(z.literal("")).transform((value) => value || undefined)
});

export const adminWishesQuerySchema = adminListQuerySchema.extend({
  visibility: z.enum(["all", "visible", "hidden"]).default("all")
});

export const adminReportsQuerySchema = adminListQuerySchema.extend({
  status: z.enum(["all", "open", "reviewed", "resolved"]).default("all")
});

export const adminGiftsQuerySchema = adminListQuerySchema.extend({
  status: z.enum(["all", "pending", "success", "failed"]).default("all")
});

export const adminWithdrawalsQuerySchema = adminListQuerySchema.extend({
  status: z.enum(["all", "pending", "approved", "rejected", "paid", "cancelled"]).default("all")
});
