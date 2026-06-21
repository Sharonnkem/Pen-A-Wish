import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

type PaystackInitializeResponse = {
  data?: {
    authorization_url: string;
    reference: string;
  };
  message?: string;
  status: boolean;
};

type PaystackVerifyResponse = {
  data?: {
    amount: number;
    currency: string;
    reference: string;
    status: string;
  };
  message?: string;
  status: boolean;
};

async function paystackRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.paystackSecretKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json().catch(() => null)) as T | null;

  if (!response.ok || !payload) {
    throw new AppError("Unable to communicate with Paystack", 502);
  }

  return payload;
}

export const paystackService = {
  async initializeTransaction(input: {
    amountKobo: number;
    callbackUrl: string;
    email: string;
    reference: string;
  }) {
    const payload = await paystackRequest<PaystackInitializeResponse>(
      "/transaction/initialize",
      {
        body: JSON.stringify({
          amount: input.amountKobo,
          callback_url: input.callbackUrl,
          email: input.email,
          reference: input.reference
        }),
        method: "POST"
      }
    );

    if (!payload.status || !payload.data?.authorization_url) {
      throw new AppError(payload.message ?? "Paystack initialization failed", 502);
    }

    return {
      authorizationUrl: payload.data.authorization_url,
      reference: payload.data.reference
    };
  },

  async verifyTransaction(reference: string) {
    const payload = await paystackRequest<PaystackVerifyResponse>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET"
      }
    );

    if (!payload.status || !payload.data) {
      throw new AppError(payload.message ?? "Paystack verification failed", 502);
    }

    return {
      amountKobo: payload.data.amount,
      currency: payload.data.currency,
      reference: payload.data.reference,
      status: payload.data.status
    };
  }
};
