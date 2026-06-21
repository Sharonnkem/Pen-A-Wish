import dotenv from "dotenv";

dotenv.config();

function readRequired(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function isLocalOrigin(origin: string) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function parseOrigins(value: string) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const frontendOrigins = parseOrigins(
  readRequired("FRONTEND_URL", "http://localhost:5173")
);
const primaryFrontendUrl =
  frontendOrigins.find((origin) => !isLocalOrigin(origin)) ?? frontendOrigins[0];

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  frontendOrigins,
  frontendUrl: primaryFrontendUrl ?? "http://localhost:5173",
  databaseUrl: readRequired(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pen_a_wish"
  ),
  databaseSsl: process.env.DATABASE_SSL === "true",
  databaseSslRejectUnauthorized:
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true",
  jwtAccessSecret: readRequired("JWT_ACCESS_SECRET", "replace-with-a-strong-secret"),
  jwtRefreshSecret: readRequired("JWT_REFRESH_SECRET", "replace-with-a-strong-secret"),
  authCookieName: readRequired(
    "AUTH_COOKIE_NAME",
    "pen_a_wish_refresh_token"
  ),
  accessTokenTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES ?? 15),
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30),
  resetPasswordTtlMinutes: Number(process.env.RESET_PASSWORD_TTL_MINUTES ?? 30),
  cloudinaryCloudName: readRequired(
    "CLOUDINARY_CLOUD_NAME",
    "your-cloudinary-cloud-name"
  ),
  cloudinaryApiKey: readRequired(
    "CLOUDINARY_API_KEY",
    "your-cloudinary-api-key"
  ),
  cloudinaryApiSecret: readRequired(
    "CLOUDINARY_API_SECRET",
    "your-cloudinary-api-secret"
  ),
  resendApiKey: readRequired("RESEND_API_KEY", "your-resend-api-key"),
  resendFromEmail: readRequired(
    "RESEND_FROM_EMAIL",
    "no-reply@penawish.com"
  ),
  paystackSecretKey: readRequired("PAYSTACK_SECRET_KEY", "your-paystack-secret-key"),
  paystackPublicKey: readRequired("PAYSTACK_PUBLIC_KEY", "your-paystack-public-key")
} as const;
