import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(150),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
  token: z.string().min(10)
});

