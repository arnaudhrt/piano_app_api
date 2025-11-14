# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with hot reload using nodemon
- `pnpm build` - Compile TypeScript to JavaScript in dist/ folder
- `pnpm start` - Run production server from compiled JavaScript
- `pnpm migrate` - Run database migrations

### Package Management
This project uses pnpm as the package manager (version 9.6.0+).

## Architecture Overview

### API Structure
This is a Node.js/Express REST API for a piano player application with the following architecture:

- **Entry Points**: `server.ts` (application startup) and `app.ts` (Express app configuration)
- **Database**: PostgreSQL with connection pooling via `pg-promise`
- **Error Handling**: Centralized error handling with custom ErrorHandler and Logger utilities
- **Versioning**: API endpoints are versioned under `/api/v1/`

### Directory Structure
```
src/
├── server.ts              # Application entry point with graceful shutdown
├── app.ts                # Express app setup with middleware
├── shared/               # Shared utilities and configuration
│   ├── config/          # Environment configuration
│   ├── database/        # Database connection and migrations
│   ├── middleware/      # Express middleware (error handling, health checks)
│   ├── models/         # Shared data models and types
│   └── utils/          # Utilities (logging, error handling)
└── v1/                  # API version 1
    └── songs/          # Songs domain (controller, routes, middleware, etc.)
```

### Key Patterns
- **MVC Pattern**: Each domain has controller, model, route, middleware, and data files
- **Singleton Database**: Database connection uses singleton pattern with connection pooling
- **Path Aliases**: TypeScript path mapping configured with `@/*` aliases
- **Error Handling**: Consistent error processing with structured logging
- **Health Checks**: Basic and detailed health check endpoints at `/health`

### Database
- Uses PostgreSQL with connection pooling
- Database migrations handled via TypeScript scripts
- Transaction support available through Database.transaction()
- Connection testing on startup with graceful failure handling

### Security & Middleware
- CORS configured for development and production environments
- Helmet for basic security headers
- Structured request logging
- Centralized error handling with appropriate HTTP status codes