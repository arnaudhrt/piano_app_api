import { ErrorHandler } from "../utils/errorHandler";
import { Logger } from "../utils/logger";
import express from "express";

export const errorHandlerMiddleware = (err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const apiError = ErrorHandler.processError(err);
  Logger.error(apiError, { path: req.path, method: req.method });

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
  });
};
