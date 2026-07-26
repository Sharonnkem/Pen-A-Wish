import { apiClient } from "./api";
import type { AuthResponse } from "../types/auth";

type MessageOnlyResponse = {
  success: true;
  message: string;
  data: Record<string, never>;
};

type ProfileUpdateResponse = AuthResponse;

export const authService = {
  register(input: { email: string; name: string; password: string }) {
    return apiClient.post<AuthResponse>("/auth/register", input);
  },
  login(input: { email: string; password: string }) {
    return apiClient.post<AuthResponse>("/auth/login", input);
  },
  logout() {
    return apiClient.post<MessageOnlyResponse>("/auth/logout");
  },
  deleteAccount() {
    return apiClient.delete<MessageOnlyResponse>("/auth/me");
  },
  refreshToken() {
    return apiClient.post<AuthResponse>("/auth/refresh-token");
  },
  forgotPassword(input: { email: string }) {
    return apiClient.post<MessageOnlyResponse>("/auth/forgot-password", input);
  },
  updateProfile(input: {
    avatarUrl: string | null;
    email: string;
    name: string;
  }) {
    return apiClient.patch<ProfileUpdateResponse>("/auth/me", input);
  },
  resetPassword(input: { password: string; token: string }) {
    return apiClient.post<MessageOnlyResponse>("/auth/reset-password", input);
  }
};
