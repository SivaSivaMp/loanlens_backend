import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectRedis, redis } from "./infrastructure/cache/redis";
import {
  connectDatabase,
  disconnectDatabase,
} from "./infrastructure/database/prisma";
import app from "./presentation/app";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const server = app.listen(Number(env.PORT), () => {
    logger.info(`Server running on port ${env.PORT} `);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully...`);

    server.close(async () => {
      await disconnectDatabase();
      await redis.quit();
      logger.info(`Server closed`);
      process.exit(0);
    });

    //forceful shutdown
    setTimeout(() => {
      logger.error(`Forced shut down`);
      process.exit(1);
    }, 10000);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // ─── Unhandled Rejections ─────────────────────────────────────────────────
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection:", reason);
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
  });
}

bootstrap();
