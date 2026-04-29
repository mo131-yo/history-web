import { auth } from "@clerk/nextjs/server";
import { atlasApiErrorResponse } from "../../atlas/atlasApiErrors";
import { upsertSyncedUser } from "@/lib/users-db";

type UserPayload = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  username?: unknown;
  imageUrl?: unknown;
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Нэвтэрсэн хэрэглэгч олдсонгүй." }, { status: 401 });
    }

    const payload = (await request.json().catch(() => ({}))) as UserPayload;
    const user = await upsertSyncedUser({
      clerkUserId: userId,
      email: cleanText(payload.email),
      firstName: cleanText(payload.firstName),
      lastName: cleanText(payload.lastName),
      username: cleanText(payload.username),
      imageUrl: cleanText(payload.imageUrl),
    });

    return Response.json({ ok: true, user });
  } catch (error) {
    console.error("[users/me POST]", error);
    return atlasApiErrorResponse(error, "Хэрэглэгчийн мэдээлэл хадгалахад алдаа гарлаа.");
  }
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
