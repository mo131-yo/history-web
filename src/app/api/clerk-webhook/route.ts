import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { sql } from '@/app/lib/db';

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SIGNING_SECRET');
    return new Response('Missing webhook secret', { status: 500 });
  }

  const body = await req.text();
  const headerList = await headers();

  const svixId = headerList.get('svix-id');
  const svixTimestamp = headerList.get('svix-timestamp');
  const svixSignature = headerList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing Svix headers');
    return new Response('Missing Svix headers', { status: 400 });
  }

  let evt: any;

  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });

    console.log('Webhook verified:', evt.type);
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  console.log('Event type:', eventType);
  console.log('Clerk user id:', data?.id);

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const email = data.email_addresses?.[0]?.email_address ?? null;

      console.log('About to upsert user:', {
        clerk_user_id: data.id,
        email,
        first_name: data.first_name,
        last_name: data.last_name,
        image_url: data.image_url,
      });

      const result = await sql`
        INSERT INTO users (
          clerk_user_id,
          email,
          first_name,
          last_name,
          image_url,
          updated_at
        )
        VALUES (
          ${data.id},
          ${email},
          ${data.first_name ?? null},
          ${data.last_name ?? null},
          ${data.image_url ?? null},
          NOW()
        )
        ON CONFLICT (clerk_user_id)
        DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          image_url = EXCLUDED.image_url,
          updated_at = NOW()
        RETURNING *
      `;

      console.log('User upserted successfully:', result);
    }

    if (eventType === 'user.deleted' && data.id) {
      const result = await sql`
        DELETE FROM users
        WHERE clerk_user_id = ${data.id}
        RETURNING *
      `;

      console.log('User deleted successfully:', result);
    }

    return new Response('OK', { status: 200 });
  } catch (dbError) {
    console.error('Database operation failed:', dbError);
    return new Response('Database error', { status: 500 });
  }
}
