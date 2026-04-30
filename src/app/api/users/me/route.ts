import { currentUser } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';
import { ensureUsersTable } from '@/lib/users-db';

export async function POST(req: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    imageUrl?: string | null;
  } = {};

  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const email =
    body.email ??
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses?.[0]?.emailAddress ??
    null;

  const firstName = body.firstName ?? clerkUser.firstName ?? null;
  const lastName = body.lastName ?? clerkUser.lastName ?? null;
  const username = body.username ?? clerkUser.username ?? null;
  const imageUrl = body.imageUrl ?? clerkUser.imageUrl ?? null;

  try {
    await ensureUsersTable();

    await sql`
      INSERT INTO users (
        clerk_user_id,
        email,
        first_name,
        last_name,
        username,
        image_url,
        updated_at
      )
      VALUES (
        ${clerkUser.id},
        ${email},
        ${firstName},
        ${lastName},
        ${username},
        ${imageUrl},
        NOW()
      )
      ON CONFLICT (clerk_user_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        username = EXCLUDED.username,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
    `;

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Sync current user failed:', error);
    return new Response('Database error', { status: 500 });
  }
}
