import { createApp } from "./app.js";
import { connectToDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Pen A Wish backend listening on http://localhost:${env.port}`);
  });

  connectToDatabase().catch((error) => {
    console.error("Database connection check failed.");
    console.error(error);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend.");
  console.error(error);
  process.exit(1);
});
