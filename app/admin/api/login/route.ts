import { cookies } from "next/headers";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "@/lib/admin-auth";

const bodySchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return Response.json(
      { error: "ADMIN_PASSWORD env тохируулаагүй тул admin login идэвхгүй байна." },
      { status: 503 },
    );
  }

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) {
    return Response.json({ error: "Нууц үг буруу байна." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return Response.json({ ok: true });
}
