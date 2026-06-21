import { z } from "zod";

export const withdrawalRequestSchema = z.object({
  accountName: z.string().trim().min(2).max(150),
  accountNumber: z.string().trim().min(6).max(30),
  amountNaira: z.coerce.number().positive().max(10000000),
  bankName: z.string().trim().min(2).max(150)
});

export const adminWithdrawalActionSchema = z.object({
  adminNote: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined)
});

export const adminWithdrawalRejectSchema = z.object({
  adminNote: z.string().trim().min(3).max(1000)
});

export const withdrawalListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().trim().max(200).optional(),
  status: z
    .enum(["all", "pending", "approved", "rejected", "paid", "cancelled"])
    .default("all")
});
