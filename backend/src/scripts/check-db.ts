import { connectToDatabase, db } from "../config/db.js";

async function main() {
  await connectToDatabase();
  console.log("Database connection successful.");
}

main()
  .catch((error) => {
    console.error("Database connection failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });

