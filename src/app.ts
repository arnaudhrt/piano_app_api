import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import { healthCheckMiddleware, healthCheckDetailedMiddleware } from "./shared/middleware/healthCheck.middleware";
import { HttpStatusCode } from "./shared/models/errors";
import { errorHandlerMiddleware } from "./shared/middleware/errorHandler.middleware";
import eventRoutes from "./v1/songs/song.route";
import { ErrorHandler } from "./shared/utils/errorHandler";
import { Logger } from "./shared/utils/logger";

// Initialize Express app
const app: Application = express();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      // Add your production frontend URL when you deploy it
      // 'https://your-frontend.vercel.app',
    ];

    if (process.env.NODE_ENV === "development") {
      // In development, allow any localhost origin
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
};

// Security middlewares (to configure for production)
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger middleware
app.use((req, res, next) => {
  Logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", healthCheckMiddleware);
app.get("/health/detailed", healthCheckDetailedMiddleware);

// API V1
app.use("/api/v1/events", eventRoutes);

// Error handling middleware
app.use(errorHandlerMiddleware);

// 404 handler
app.use((req, res) => {
  const apiError = ErrorHandler.processError(new Error("Route not found"));
  Logger.error(apiError, { path: req.path, method: req.method });
  res.status(HttpStatusCode.NOT_FOUND).json({ success: false, message: "Route not found" });
});

export default app;
