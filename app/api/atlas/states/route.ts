// // import { z } from "zod";
// // import { createAtlasState, getAtlasForYear } from "@/lib/db";
// // import { normalizeClosedRing } from "@/lib/geometry";
// // import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

// // const querySchema = z.object({
// //   year: z.coerce.number().int().min(1100).max(1400),
// // });

// // const pointSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

// // const bodySchema = z.object({
// //   year: z.number().int().min(1100).max(1400),
// //   name: z.string().min(2),
// //   leader: z.string().min(1),
// //   capital: z.string().min(1),
// //   color: z.string().min(4).max(20),
// //   summary: z.string().min(8),
// //   metadata: z.record(z.string(), z.unknown()).optional(),
// //   coordinates: z.array(pointSchema).min(4),
// // });

// // export async function GET(request: Request) {
// //   const { searchParams } = new URL(request.url);
// //   const parsed = querySchema.safeParse({
// //     year: searchParams.get("year"),
// //   });

// //   if (!parsed.success) {
// //     return Response.json({ error: "Зөв year параметр дамжуулна уу." }, { status: 400 });
// //   }

// //   const collection = await getAtlasForYear(parsed.data.year);
// //   return Response.json(collection);
// // }

// // export async function POST(request: Request) {
// //   const session = request.headers.get("cookie")?.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`))?.[1];

// //   if (!isValidAdminSession(session)) {
// //     return Response.json({ error: "Admin эрх шаардлагатай." }, { status: 403 });
// //   }

// //   const payload = await request.json();
// //   const parsed = bodySchema.safeParse(payload);

// //   if (!parsed.success) {
// //     return Response.json({ error: "Шинэ улсын мэдээлэл дутуу эсвэл буруу байна." }, { status: 400 });
// //   }

// //   const ring = normalizeClosedRing(parsed.data.coordinates);

// //   if (ring.length < 4) {
// //     return Response.json({ error: "Polygon дор хаяж 3 оройтой байна." }, { status: 400 });
// //   }

// //   const feature = await createAtlasState({
// //     year: parsed.data.year,
// //     name: parsed.data.name,
// //     leader: parsed.data.leader,
// //     capital: parsed.data.capital,
// //     color: parsed.data.color,
// //     summary: parsed.data.summary,
// //     metadata: parsed.data.metadata,
// //     geometry: {
// //       type: "Polygon",
// //       coordinates: [ring],
// //     },
// //   });

// //   return Response.json({ feature }, { status: 201 });
// // }





// // app/api/atlas/states/route.ts
// import { z } from "zod";
// import { createAtlasState, getAtlasForYear } from "@/lib/db";
// import { normalizeClosedRing } from "@/lib/geometry";

// const querySchema = z.object({
//   year: z.coerce.number().int().min(1100).max(1400),
// });

// const pointSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

// const bodySchema = z.object({
//   year: z.number().int().min(1100).max(1400),
//   name: z.string().min(2),
//   leader: z.string().min(1),
//   capital: z.string().min(1),
//   color: z.string().min(4).max(20),
//   summary: z.string().min(8),
//   metadata: z.record(z.string(), z.unknown()).optional(),
//   coordinates: z.array(pointSchema).min(4),
// });

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const parsed = querySchema.safeParse({ year: searchParams.get("year") });
//   if (!parsed.success) {
//     return Response.json({ error: "Зөв year параметр дамжуулна уу." }, { status: 400 });
//   }
//   const collection = await getAtlasForYear(parsed.data.year);
//   return Response.json(collection);
// }

// export async function POST(request: Request) {
//   const payload = await request.json();
//   const parsed = bodySchema.safeParse(payload);
//   if (!parsed.success) {
//     return Response.json({ error: "Шинэ улсын мэдээлэл дутуу эсвэл буруу байна." }, { status: 400 });
//   }
//   const ring = normalizeClosedRing(parsed.data.coordinates);
//   if (ring.length < 4) {
//     return Response.json({ error: "Polygon дор хаяж 3 оройтой байна." }, { status: 400 });
//   }
//   const feature = await createAtlasState({
//     year: parsed.data.year,
//     name: parsed.data.name,
//     leader: parsed.data.leader,
//     capital: parsed.data.capital,
//     color: parsed.data.color,
//     summary: parsed.data.summary,
//     metadata: parsed.data.metadata,
//     geometry: { type: "Polygon", coordinates: [ring] },
//   });
//   return Response.json({ feature }, { status: 201 });
// }




// app/api/atlas/states/route.ts
import { z } from "zod";
import { createAtlasState, getAtlasForYear } from "@/lib/db";
import { normalizeClosedRing } from "@/lib/geometry";
import { requireAdmin } from "@/app/lib/clerk";

const querySchema = z.object({
  year: z.coerce.number().int().min(1100).max(1400),
});

const pointSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

const bodySchema = z.object({
  year: z.number().int().min(1100).max(1400),
  name: z.string().min(2),
  leader: z.string().min(1),
  capital: z.string().min(1),
  color: z.string().min(4).max(20),
  summary: z.string().min(8),
  metadata: z.record(z.string(), z.unknown()).optional(),
  coordinates: z.array(pointSchema).min(4),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ year: searchParams.get("year") });
  if (!parsed.success) {
    return Response.json({ error: "Зөв year параметр дамжуулна уу." }, { status: 400 });
  }
  const collection = await getAtlasForYear(parsed.data.year);
  return Response.json(collection);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Шинэ улсын мэдээлэл дутуу эсвэл буруу байна." }, { status: 400 });
  }
  const ring = normalizeClosedRing(parsed.data.coordinates);
  if (ring.length < 4) {
    return Response.json({ error: "Polygon дор хаяж 3 оройтой байна." }, { status: 400 });
  }
  const feature = await createAtlasState({
    year: parsed.data.year,
    name: parsed.data.name,
    leader: parsed.data.leader,
    capital: parsed.data.capital,
    color: parsed.data.color,
    summary: parsed.data.summary,
    metadata: parsed.data.metadata,
    geometry: { type: "Polygon", coordinates: [ring] },
  });
  return Response.json({ feature }, { status: 201 });
}