// app/api/webhooks/clerk/route.ts
// Clerk webhook: user.updated гэх мэт event дээр role-ийг sync хийх
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_KEY;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret байхгүй.", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Svix header дутуу.", { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  try {
    wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Webhook verification амжилтгүй.", { status: 400 });
  }

  // Webhook verified — event-ийг process хийх
  // Энд DB sync хийх боломжтой, гэхдээ бид Clerk publicMetadata-г шууд ашиглаж байгаа
  console.log("Clerk webhook received:", payload.type);

  return new Response("OK", { status: 200 });
}