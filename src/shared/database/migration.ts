import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs/promises";
import path from "path";
import { db } from "./database";
import { Database } from "./database";

export class MigrationRunner {
  private migrationsDir: string;
  private db: Database;

  constructor(migrationsDir: string = "./migrations") {
    this.migrationsDir = migrationsDir;
    this.db = db;
  }

  async ensureMigrationsTable() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.db.query("SELECT filename FROM migrations ORDER BY id");
    return result.rows.map((row) => row.filename);
  }

  async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.migrationsDir);
      return files.filter((file) => file.endsWith(".sql")).sort();
    } catch (error) {
      console.error(`Migrations directory ${this.migrationsDir} not found. Creating it...`);
      await fs.mkdir(this.migrationsDir, { recursive: true });
      return [];
    }
  }

  async runMigrations() {
    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = await this.getMigrationFiles();

    const pendingMigrations = migrationFiles.filter((file) => !executedMigrations.includes(file));

    if (pendingMigrations.length === 0) {
      console.info("No pending migrations");
      return;
    }

    for (const filename of pendingMigrations) {
      console.info(`Running migration: ${filename}`);

      const filePath = path.join(this.migrationsDir, filename);
      const content = await fs.readFile(filePath, "utf-8");

      // Split by -- ROLLBACK to separate up and down migrations
      const [upMigration] = content.split("-- ROLLBACK");

      await this.db.transaction(async (client) => {
        await client.query(upMigration.trim());
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [filename]);
      });

      console.info(`Migration ${filename} completed`);
    }
  }

  async rollbackLast() {
    await this.ensureMigrationsTable();

    const result = await this.db.query("SELECT filename FROM migrations ORDER BY id DESC LIMIT 1");

    if (result.rows.length === 0) {
      console.info("No migrations to rollback");
      return;
    }

    const filename = result.rows[0].filename;
    console.info(`Rolling back migration: ${filename}`);

    const filePath = path.join(this.migrationsDir, filename);
    const content = await fs.readFile(filePath, "utf-8");

    // Get rollback part after -- ROLLBACK
    const parts = content.split("-- ROLLBACK");
    if (parts.length < 2) {
      throw new Error(`No rollback section found in ${filename}`);
    }

    const rollbackMigration = parts[1].trim();

    await this.db.transaction(async (client) => {
      await client.query(rollbackMigration);
      await client.query("DELETE FROM migrations WHERE filename = $1", [filename]);
    });

    console.info(`Migration ${filename} rolled back`);
  }

  async createMigration(name: string) {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
    const filename = `${timestamp}_${name.replace(/\s+/g, "_")}.sql`;
    const filePath = path.join(this.migrationsDir, filename);

    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- UP
CREATE TABLE example (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROLLBACK
DROP TABLE example;
`;

    await fs.mkdir(this.migrationsDir, { recursive: true });
    await fs.writeFile(filePath, template);

    console.info(`Migration created: ${filename}`);
    return filename;
  }
}
