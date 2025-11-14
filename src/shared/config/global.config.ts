import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || "localhost",
  REACT_APP_URL: process.env.REACT_APP_URL || "http://localhost:3000",
  API_URL: process.env.API_URL || "http://localhost:3001",
  DATABASE_URL: process.env.DATABASE_URL || "",
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS || true,
};
