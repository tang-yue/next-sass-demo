import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "./schema";

function getDb() {
  if (process.env.NEON_DB_URL) {
    const sql = neon(process.env.NEON_DB_URL!);
    return drizzleNeon(sql, { schema: schema });
  }
  return drizzle(process.env.DATABASE_URL!, { schema: schema });
}

export const db = getDb();