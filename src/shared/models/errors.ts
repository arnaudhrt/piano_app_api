// ============================================================================
// PostgreSQL error
// ============================================================================
export interface PostgresError extends Error {
  code?: string;
  detail?: string;
  schema?: string;
  table?: string;
  column?: string;
  constraint?: string;
}

// ============================================================================
// HTTP status codes
// ============================================================================
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// ============================================================================
// PostgreSQL error codes
// ============================================================================
export enum PostgresErrorCode {
  // Class 23 — Integrity Constraint Violation
  UNIQUE_VIOLATION = "23505",
  FOREIGN_KEY_VIOLATION = "23503",
  CHECK_VIOLATION = "23514",
  NOT_NULL_VIOLATION = "23502",

  // Class 42 — Syntax Error or Access Rule Violation
  UNDEFINED_TABLE = "42P01",
  UNDEFINED_COLUMN = "42703",
  UNDEFINED_FUNCTION = "42883",

  // Class 08 — Connection Exception
  CONNECTION_FAILURE = "08006",

  // Class 53 — Insufficient Resources
  CONNECTION_LIMIT_EXCEEDED = "53300",

  // Class 57 — Operator Intervention
  ADMIN_SHUTDOWN = "57P01",
  CRASH_SHUTDOWN = "57P02",

  // Class 28 — Invalid Authorization Specification
  INVALID_PASSWORD = "28P01",
}
