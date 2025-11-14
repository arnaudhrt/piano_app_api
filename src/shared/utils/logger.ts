import { ApiError } from "./errorHandler";

interface Context {
  [key: string]: any;
}

export class Logger {
  public static info(message: string, context?: Context) {
    console.warn({
      message,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  public static warn(message: string, context?: Context) {
    console.warn({
      message,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  public static error(error: ApiError, context?: Context) {
    console.error({
      message: error.message,
      timestamp: error.timestamp,
      statusCode: error.statusCode,
      pgErrorCode: error.pgErrorCode,
      isOperational: error.isOperational,
      stack: error.stack,
      ...context,
    });
  }
}
