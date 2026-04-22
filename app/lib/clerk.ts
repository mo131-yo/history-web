import { auth, currentUser } from "@clerk/nextjs/server";

export async function isAdminUser(): Promise<boolean> {
  const { userId, sessionClaims } = await auth();
  if (!userId) return false;

  // Check publicMetadata.role === "admin" set via Clerk Dashboard or webhook
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role === "admin") return true;

  // Fallback: check user's publicMetadata directly
  const user = await currentUser();
  const metaRole = (user?.publicMetadata as { role?: string } | undefined)?.role;
  return metaRole === "admin";
}

export async function requireAdmin() {
  const admin = await isAdminUser();
  if (!admin) {
    return new Response(JSON.stringify({ error: "Admin эрх шаардлагатай." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}