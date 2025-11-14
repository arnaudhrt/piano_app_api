import { Request, Response } from "express";
import { ApiResponse } from "@/shared/models/response";
import { db } from "@/shared/database/database";
import { env } from "../config/global.config";

export const healthCheckMiddleware = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: "Service is healthy",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  };
  res.status(200).json(response);
};

export const healthCheckDetailedMiddleware = async (req: Request, res: Response) => {
  // Test database connection
  let dbStatus = "disconnected";
  let dbResponseTime: number | undefined;

  try {
    const dbStart = Date.now();
    await db.testConnection();
    dbResponseTime = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (error) {
    dbStatus = "disconnected";
  }

  // Get memory usage
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

  // Get uptime
  const uptime = process.uptime();

  const healthData = {
    status: dbStatus === "connected" ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime),
    environment: env.NODE_ENV,
    database: {
      status: dbStatus,
      responseTime: dbResponseTime,
    },
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: memoryPercentage,
    },
  };

  const statusCode = healthData.status === "healthy" ? 200 : 503;
  res.status(statusCode).json({ success: true, data: healthData });
};
