import dotenv from "dotenv";
import { app } from "./app.js";
import { checkDbConnection, closeDb, db, links } from "./db/index.js";
import { and, isNotNull, lt } from "drizzle-orm";

dotenv.config();

// Physically remove links past their grace period (expiresAt + 7d). Runs at
// boot and then daily; the timer is unref'd so it never blocks shutdown.
const purgeExpiredLinks = async (): Promise<void> => {
  try {
    const deleted = await db
      .delete(links)
      .where(and(isNotNull(links.deleteAt), lt(links.deleteAt, new Date())))
      .returning({ id: links.id });

    if (deleted.length > 0) {
      console.log(`Purged ${deleted.length} expired link(s)`);
    }
  } catch (error) {
    console.error("[purge] failed:", error);
  }
};

await purgeExpiredLinks();
const purgeTimer = setInterval(() => void purgeExpiredLinks(), 24 * 60 * 60 * 1000);
purgeTimer.unref();

// Some shells inject PORT=0 (and dotenv never overrides existing env vars),
// so coerce explicitly and fall back to 8000 rather than binding at random.
const port = Number(process.env.PORT) || 8000;

try {
  await checkDbConnection();

  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
} catch (error) {
  console.error("Error connecting to the database or starting the server:", error);
  process.exit(1);
}
