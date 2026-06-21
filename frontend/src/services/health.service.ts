import { apiClient } from "@/services/api";

type HealthResponse = {
  success: boolean;
  message: string;
  data: {
    status: string;
    service: string;
    timestamp: string;
  };
};

export const healthApi = {
  getHealth() {
    return apiClient.get<HealthResponse>("/health");
  }
};

