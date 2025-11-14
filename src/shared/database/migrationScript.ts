import path from "path";
import { MigrationRunner } from "./migration";
import { db } from "./database";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "up";
  const migrationName = args[1];

  try {
    // Set migrations directory relative to project root
    const migrationsDir = path.join(process.cwd(), "src/shared/database/migrations");
    const migrationRunner = new MigrationRunner(migrationsDir);

    switch (command) {
      case "up":
        console.info("Running pending migrations...");
        await migrationRunner.runMigrations();
        break;

      case "down":
        console.info("Rolling back last migration...");
        await migrationRunner.rollbackLast();
        break;

      case "status":
        await showMigrationStatus(migrationRunner);
        break;

      case "create":
        if (!migrationName) {
          console.error("Migration name is required for create command");
          console.info('Usage: pnpm run migrate create "migration_name"');
          process.exit(1);
        }
        const filename = await migrationRunner.createMigration(migrationName);
        console.info(`Created migration: ${filename}`);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.info("Available commands: up, down, status, create");
        process.exit(1);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

async function showMigrationStatus(migrationRunner: MigrationRunner) {
  try {
    await migrationRunner.ensureMigrationsTable();

    const executedMigrations = await migrationRunner.getExecutedMigrations();
    const migrationFiles = await migrationRunner.getMigrationFiles();

    const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.includes(file));

    console.info("=== Migration Status ===");

    if (executedMigrations.length > 0) {
      console.info("Executed migrations:");
      executedMigrations.forEach((migration) => {
        console.info(`  ✓ ${migration}`);
      });
    } else {
      console.info("No executed migrations");
    }

    if (pendingMigrations.length > 0) {
      console.info("Pending migrations:");
      pendingMigrations.forEach((migration) => {
        console.info(`  ○ ${migration}`);
      });
    } else {
      console.info("No pending migrations");
    }

    console.info(`Total: ${migrationFiles.length} migrations (${executedMigrations.length} executed, ${pendingMigrations.length} pending)`);
  } catch (error) {
    console.error("Failed to get migration status:", error);
    throw error;
  }
}

// Handle uncaught errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
