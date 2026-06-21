import { z } from "zod";

export const giftInitializeSchema = z.object({
  amountNaira: z.coerce.number().positive().max(10000000),
  message: z
    .string()
    .trim()
    .max(1500)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  senderEmail: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  senderName: z.string().trim().min(2).max(150)
});

export const paystackVerifySchema = z.object({
  reference: z.string().trim().min(6).max(255)
});
