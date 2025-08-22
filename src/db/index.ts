import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export const db =
  globalForDb.db ??
  drizzle(
    new Pool({
      connectionString:
        process.env.NODE_ENV === "production"
          ? process.env.DATABASE_URL!
          : process.env.DEV_DATABASE_URL!,
      ssl: { rejectUnauthorized: false }, // necesario con Neon
    }),
    { schema }
  );

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
