import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Put it in apps/mongol-atlas/.env.local and restart yarn dev.',
  );
}

export const sql = neon(databaseUrl);
export { ensureAtlasDatabase } from "./atlas-db-core";
export { listAtlasYears, getAtlasForYear } from "./atlas-db-read";
export { getAtlasEventsForYear } from "./atlas-events";
export {
  createAtlasState,
  deleteAtlasState,
  updateAtlasState,
  updateStateGeometry,
} from "./atlas-db-write";
