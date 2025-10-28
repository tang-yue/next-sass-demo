import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.NEON_DB_URL!,
  },
});