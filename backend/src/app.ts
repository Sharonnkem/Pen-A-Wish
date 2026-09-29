import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.route.js";
import { adminRouter } from "./routes/admin.route.js";
import { dashboardRouter } from "./routes/dashboard.route.js";
import { eventRouter } from "./routes/event.route.js";
import { healthRouter } from "./routes/health.route.js";
import { paymentRouter } from "./routes/payment.route.js";
import { uploadRouter } from "./routes/upload.route.js";
import { walletRouter } from "./routes/wallet.route.js";
import {
  getCelebrationShareImage,
  getCelebrationSharePage
} from "./controllers/share.controller.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const trustedProductionOrigins = [
  "https://pen-a-wish.vercel.app",
  "https://pen-a-wish-frontend-six.vercel.app",
  "https://wishmarsh.vercel.app"
];

export function createApp() {
  const app = express();
  const configuredOrigins = new Set([
    ...env.frontendOrigins,
    ...trustedProductionOrigins
  ]);

  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        const isConfiguredOrigin = configuredOrigins.has(origin);
        const isLocalDevOrigin =
          env.nodeEnv !== "production" &&
          /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

        if (isConfiguredOrigin || isLocalDevOrigin) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS"));
      }
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      success: true,
      message: "Pen A Wish API is running",
      data: {
        docs: "/api/health"
      }
    });
  });

  app.get("/share/events/:slug", getCelebrationSharePage);
  app.get("/share/events/:slug/image.png", getCelebrationShareImage);

  app.use("/api/auth", authRouter);
  app.use("/api", adminRouter);
  app.use("/api", dashboardRouter);
  app.use("/api", eventRouter);
  app.use("/api", paymentRouter);
  app.use("/api", walletRouter);
  app.use("/api/health", healthRouter);
  app.use("/api/uploads", uploadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
