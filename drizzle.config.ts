import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NODE_ENV === "production"
        ? process.env.DATABASE_URL!
        : process.env.DEV_DATABASE_URL!,
  },
});