/**
 * NeonDB Connection Client
 * Uses the Neon Serverless Driver (HTTP mode) for React Native compatibility.
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL =
  process.env.EXPO_PUBLIC_NEONDB_URL ||
  'postgresql://neondb_owner:npg_Uge6l5kyvjWc@ep-bold-thunder-a4yhhuxl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

/**
 * Neon SQL tagged-template client.
 * Usage:  const rows = await sql`SELECT * FROM cranes`;
 */
export const sql = neon(DATABASE_URL);
