import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  verbose: true,
  strict: true,
  // out: "./server/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});