import dotenv from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

// Loaded here too: ESM import hoisting means this module can evaluate before
// the dotenv.config() call in index.ts.
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set: copy .env.example to .env first");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, { schema });

export const checkDbConnection = async (): Promise<void> => {
  await pool.query("select 1");
  console.log("Connected to PostgreSQL");
};

export const closeDb = async (): Promise<void> => {
  await pool.end();
};

export { schema };
// Re-export tables + row types so controllers can import everything from here.
export * from "./schema.js";
