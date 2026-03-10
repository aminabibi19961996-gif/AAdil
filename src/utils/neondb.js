/**
 * NeonDB Connection Client
 * Uses the Neon Serverless Driver (HTTP mode) for React Native compatibility.
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.EXPO_PUBLIC_NEONDB_URL;

if (!DATABASE_URL) {
  throw new Error('EXPO_PUBLIC_NEONDB_URL environment variable is not set');
}

/**
 * Neon SQL tagged-template client.
 * Usage:  const rows = await sql`SELECT * FROM cranes`;
 */
export const sql = neon(DATABASE_URL);
