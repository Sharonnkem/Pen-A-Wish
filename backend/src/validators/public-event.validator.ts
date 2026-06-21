import { z } from "zod";

export const publicWishSchema = z.object({
  message: z.string().trim().min(1).max(1500),
  senderEmail: z.string().email().optional().or(z.literal("")).transform((value) => value || undefined),
  senderName: z.string().trim().min(2).max(150)
});

export const publicGuestbookSchema = z.object({
  message: z.string().trim().min(12).max(4000),
  senderEmail: z.string().email().optional().or(z.literal("")).transform((value) => value || undefined),
  senderName: z.string().trim().min(2).max(150)
});

export const publicReactionSchema = z.object({
  reactionType: z.string().trim().min(1).max(50),
  visitorFingerprint: z.string().trim().min(4).max(255).optional()
});
