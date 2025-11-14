import { HttpStatusCode, PostgresErrorCode, PostgresError } from "../models/errors";

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly timestamp: string;
  public readonly pgErrorCode?: string;

  constructor(
    timestamp: string,
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    pgErrorCode?: string
  ) {
    super(message);
    this.timestamp = timestamp;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.pgErrorCode = pgErrorCode;

    // Capturing stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ErrorHandler {
  public static processError(error: unknown): ApiError {
    // If it's already an AppError, return it
    if (error instanceof ApiError) {
      return error;
    }

    // Handle PostgreSQL errors
    if (this.isPostgresError(error)) {
      return this.handlePostgresError(error);
    }

    // Handle generic Error objects
    if (error instanceof Error) {
      const errorMessage = error.message && error.message !== "" ? error.message : "An unexpected error occurred";
      return new ApiError(new Date().toISOString(), errorMessage, HttpStatusCode.INTERNAL_SERVER_ERROR, false);
    }

    // Handle non-Error objects
    const errorMessage = typeof error === "string" && error !== "" ? error : "An unexpected error occurred";
    return new ApiError(new Date().toISOString(), errorMessage, HttpStatusCode.INTERNAL_SERVER_ERROR, false);
  }

  private static isPostgresError(error: unknown): error is PostgresError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as PostgresError).code === "string" &&
      (error as PostgresError).code?.length === 5
    );
  }

  public static handlePostgresError(error: PostgresError): ApiError {
    // If it's already an AppError, return it
    if (error instanceof ApiError) {
      return error;
    }

    const pgErrorCode = error.code;

    // Handle specific PostgreSQL error codes
    switch (pgErrorCode) {
      // Integrity Constraint Violations
      case PostgresErrorCode.UNIQUE_VIOLATION:
        return new ApiError(new Date().toISOString(), "A record with this value already exists", HttpStatusCode.CONFLICT, true, pgErrorCode);

      case PostgresErrorCode.FOREIGN_KEY_VIOLATION:
        return new ApiError(
          new Date().toISOString(),
          "This operation violates a foreign key constraint",
          HttpStatusCode.BAD_REQUEST,
          true,
          pgErrorCode
        );

      case PostgresErrorCode.NOT_NULL_VIOLATION:
        return new ApiError(new Date().toISOString(), "Required field is missing", HttpStatusCode.BAD_REQUEST, true, pgErrorCode);

      case PostgresErrorCode.CHECK_VIOLATION:
        return new ApiError(new Date().toISOString(), "The value violates a check constraint", HttpStatusCode.BAD_REQUEST, true, pgErrorCode);

      // Syntax and Access Rule Violations
      case PostgresErrorCode.UNDEFINED_TABLE:
        return new ApiError(new Date().toISOString(), "The requested table does not exist", HttpStatusCode.INTERNAL_SERVER_ERROR, false, pgErrorCode);

      case PostgresErrorCode.UNDEFINED_COLUMN:
        return new ApiError(
          new Date().toISOString(),
          "The requested column does not exist",
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          false,
          pgErrorCode
        );

      case PostgresErrorCode.UNDEFINED_FUNCTION:
        return new ApiError(
          new Date().toISOString(),
          "The requested function does not exist",
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          false,
          pgErrorCode
        );

      // Connection Exceptions
      case PostgresErrorCode.CONNECTION_FAILURE:
      case PostgresErrorCode.CONNECTION_LIMIT_EXCEEDED:
        return new ApiError(new Date().toISOString(), "Database connection error", HttpStatusCode.SERVICE_UNAVAILABLE, true, pgErrorCode);

      // Authorization
      case PostgresErrorCode.INVALID_PASSWORD:
        return new ApiError(new Date().toISOString(), "Invalid database credentials", HttpStatusCode.INTERNAL_SERVER_ERROR, false, pgErrorCode);

      // Server Shutdown
      case PostgresErrorCode.ADMIN_SHUTDOWN:
      case PostgresErrorCode.CRASH_SHUTDOWN:
        return new ApiError(
          new Date().toISOString(),
          "Database server is currently unavailable",
          HttpStatusCode.SERVICE_UNAVAILABLE,
          true,
          pgErrorCode
        );

      // Default case for unhandled postgres errors
      default:
        return new ApiError(
          new Date().toISOString(),
          "An unexpected database error occurred",
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          false,
          pgErrorCode
        );
    }
  }
}
