export async function GET() {
  return Response.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasClerkWebhookSecret: Boolean(process.env.CLERK_WEBHOOK_SIGNING_SECRET),
    hasClerkPublishableKey: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ),
    hasClerkSecretKey: Boolean(process.env.CLERK_SECRET_KEY),
  });
}
