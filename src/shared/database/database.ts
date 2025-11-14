import { Pool, PoolClient } from "pg";
import { env } from "../config/global.config";

export class Database {
  private pool: Pool;
  private static instance: Database | null = null;

  private constructor() {
    this.pool = new Pool({
      connectionString: env.DATABASE_URL || "",
      ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async testConnection() {
    try {
      await this.query("SELECT NOW()");
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }

  public async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.debug("Executed query", { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error("Database query error:", { text, params, error });
      throw error;
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    Database.instance = null;
    console.info("Database pool closed");
  }
}

export const db = Database.getInstance();
