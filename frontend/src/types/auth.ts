export type UserRole = "user" | "admin";

export type AuthUser = {
  avatarUrl?: string | null;
  email: string;
  id: string;
  name: string;
  role: UserRole;
};

export type AuthResponse = {
  success: true;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
};
