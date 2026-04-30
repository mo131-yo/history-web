import { sql } from './db';

export type SyncedUserInput = {
  clerkUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
};

export async function ensureUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      clerk_user_id TEXT NOT NULL,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS clerk_user_id TEXT
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email TEXT
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name TEXT
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_name TEXT
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username TEXT
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS image_url TEXT
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_clerk_user_id_unique
    ON users (clerk_user_id)
  `;
}

export async function upsertSyncedUser(user: SyncedUserInput) {
  await ensureUsersTable();

  const rows = await sql`
    INSERT INTO users (
      clerk_user_id,
      email,
      first_name,
      last_name,
      username,
      image_url,
      updated_at,
      last_seen_at
    )
    VALUES (
      ${user.clerkUserId},
      ${user.email},
      ${user.firstName},
      ${user.lastName},
      ${user.username},
      ${user.imageUrl},
      NOW(),
      NOW()
    )
    ON CONFLICT (clerk_user_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      username = EXCLUDED.username,
      image_url = EXCLUDED.image_url,
      updated_at = NOW(),
      last_seen_at = NOW()
    RETURNING
      clerk_user_id,
      email,
      first_name,
      last_name,
      username,
      image_url,
      updated_at::text,
      last_seen_at::text
  `;

  return rows[0];
}
