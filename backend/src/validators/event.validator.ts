import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const eventSchema = z.object({
  celebrantName: z.string().trim().min(2).max(150),
  coverImageUrl: z.string().url().optional().nullable(),
  description: z.string().trim().min(1).max(5000),
  eventDate: z
    .string()
    .regex(datePattern, "Event date must be in YYYY-MM-DD format"),
  eventType: z.string().trim().min(2).max(80),
  profileImageUrl: z.string().url().optional().nullable(),
  title: z.string().trim().min(2).max(200)
});

export const uploadImageSchema = z.object({
  folder: z.enum(["avatars", "events", "covers"])
});
