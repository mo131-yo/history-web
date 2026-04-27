import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { sql } from '../../../lib/db';

type ClerkEmail = {
  id: string;
  email_address: string;
};

type ClerkUserData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmail[];
};

type ClerkWebhookEvent = {
  type: string;
  data: ClerkUserData;
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();

  if (!secret) {
    return new Response('Missing CLERK_WEBHOOK_SIGNING_SECRET', {
      status: 500,
    });
  }

  const payload = await req.text();
  const headerPayload = await headers();

  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const wh = new Webhook(secret);

  let evt: ClerkWebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Webhook verify failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;
  const user = evt.data;

  const email =
    user.email_addresses?.find(
      (item) => item.id === user.primary_email_address_id,
    )?.email_address ??
    user.email_addresses?.[0]?.email_address ??
    null;

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      await sql`
        INSERT INTO users (
          clerk_user_id,
          email,
          first_name,
          last_name,
          image_url,
          updated_at
        )
        VALUES (
          ${user.id},
          ${email},
          ${user.first_name ?? null},
          ${user.last_name ?? null},
          ${user.image_url ?? null},
          NOW()
        )
        ON CONFLICT (clerk_user_id)
        DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          image_url = EXCLUDED.image_url,
          updated_at = NOW()
      `;
    }

    if (eventType === 'user.deleted') {
      await sql`
        DELETE FROM users
        WHERE clerk_user_id = ${user.id}
      `;
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('DB sync failed:', err);
    return new Response('Database error', { status: 500 });
  }
}
