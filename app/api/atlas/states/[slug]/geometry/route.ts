import { z } from "zod";
import { updateStateGeometry } from "@/lib/db";
import { normalizeClosedRing } from "@/lib/geometry";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

const pointSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

const bodySchema = z.object({
  year: z.number().int().min(1100).max(1400),
  coordinates: z.array(pointSchema).min(4),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = request.headers.get("cookie")?.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`))?.[1];

  if (!isValidAdminSession(session)) {
    return Response.json({ error: "Admin эрх шаардлагатай." }, { status: 403 });
  }

  const { slug } = await context.params;
  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json({ error: "Координатын бүтэц буруу байна." }, { status: 400 });
  }

  const ring = normalizeClosedRing(parsed.data.coordinates);

  if (ring.length < 4) {
    return Response.json({ error: "Polygon дор хаяж 3 оройтой байна." }, { status: 400 });
  }

  const feature = await updateStateGeometry(parsed.data.year, slug, {
    type: "Polygon",
    coordinates: [ring],
  });

  if (!feature) {
    return Response.json({ error: "Тухайн улсын бичлэг олдсонгүй." }, { status: 404 });
  }

  return Response.json({ feature });
}
