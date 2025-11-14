import app from "./app";
import { ErrorHandler } from "./shared/utils/errorHandler";
import { db } from "./shared/database/database";
import { env } from "./shared/config/global.config";
import { Logger } from "./shared/utils/logger";

const PORT = env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await db.testConnection();
    // Start server
    const server = app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
    });
    // Graceful shutdown handler
    const gracefulShutdown = (signal: string) => {
      Logger.info(`${signal} received, shutting down gracefully`);
      server.close(async () => {
        Logger.info("HTTP server closed");
        await db.close();
        process.exit(0);
      });
    };
    // Handle signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    const apiError = ErrorHandler.processError(error);
    Logger.error(apiError);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  const apiError = ErrorHandler.processError(error);
  Logger.error(apiError);
  process.exit(1);
});

// Handle unhandled rejections
process.on("unhandledRejection", (reason: unknown) => {
  const apiError = ErrorHandler.processError(reason);
  Logger.error(apiError);
  process.exit(1);
});

startServer();
