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
//   const parsed = querySchema.safeParse({
//     year: searchParams.get("year"),
//   });

//   if (!parsed.success) {
//     return Response.json({ error: "Зөв year параметр дамжуулна уу." }, { status: 400 });
//   }

//   const collection = await getAtlasForYear(parsed.data.year);
//   return Response.json(collection);
// }

// export async function POST(request: Request) {

//   const payload = await request.json();
//   const parsed = bodySchema.safeParse(  payload);

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
//     geometry: {
//       type: "Polygon",
//       coordinates: [ring],
//     },
//   });
//   const collection = await getAtlasForYear(parsed.data.year);

//   return Response.json({ feature, collection }, { status: 201 });
// }




import { z } from "zod";
import { createAtlasState, getAtlasForYear } from "@/lib/db";
import { normalizeClosedRing } from "@/lib/geometry";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  year: z.coerce.number().int().min(1100).max(1400),
});

const pointSchema = z.tuple([
  z.coerce.number().min(-180).max(180),
  z.coerce.number().min(-90).max(90),
]);

const bodySchema = z.object({
  year: z.coerce.number().int().min(1100).max(1400),

  name: z
    .string()
    .trim()
    .min(2, "Нэр дор хаяж 2 тэмдэгт байна."),

  leader: z
    .string()
    .trim()
    .optional()
    .default("Тодорхойгүй"),

  capital: z
    .string()
    .trim()
    .optional()
    .default("Тодорхойгүй"),

  color: z
    .string()
    .trim()
    .min(4)
    .max(20)
    .default("#c9a45d"),

  summary: z
    .string()
    .trim()
    .min(8, "Тайлбар дор хаяж 8 тэмдэгт байна."),

  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .default({}),

  coordinates: z
    .array(pointSchema)
    .min(4, "Polygon дор хаяж 4 coordinate point-той байна."),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = querySchema.safeParse({
      year: searchParams.get("year"),
    });

    if (!parsed.success) {
      return Response.json(
        {
          error: "Зөв year параметр дамжуулна уу.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const collection = await getAtlasForYear(parsed.data.year);

    return Response.json(collection);
  } catch (err) {
    console.error("[atlas/states GET]", err);

    return Response.json(
      {
        error: "Газрын зураг ачаалахад серверийн алдаа гарлаа.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);

    if (!payload) {
      return Response.json(
        {
          error: "JSON body буруу байна.",
        },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse(payload);

    if (!parsed.success) {
      console.error("[atlas/states POST validation]", {
        payload,
        issues: parsed.error.issues,
        flattened: parsed.error.flatten(),
      });

      return Response.json(
        {
          error: "Шинэ улсын мэдээлэл дутуу эсвэл буруу байна.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const ring = normalizeClosedRing(parsed.data.coordinates);

    const uniquePoints = new Set(
      ring.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`)
    );

    if (ring.length < 4 || uniquePoints.size < 3) {
      return Response.json(
        {
          error: "Polygon дор хаяж 3 өөр оройтой байна.",
        },
        { status: 400 }
      );
    }

    const feature = await createAtlasState({
      year: parsed.data.year,
      name: parsed.data.name,
      leader: parsed.data.leader || "Тодорхойгүй",
      capital: parsed.data.capital || "Тодорхойгүй",
      color: parsed.data.color || "#c9a45d",
      summary: parsed.data.summary,
      metadata: parsed.data.metadata,
      geometry: {
        type: "Polygon",
        coordinates: [ring],
      },
    });

    const collection = await getAtlasForYear(parsed.data.year);

    return Response.json(
      {
        feature,
        collection,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[atlas/states POST]", err);

    return Response.json(
      {
        error: "Шинэ улс хадгалахад серверийн алдаа гарлаа.",
      },
      { status: 500 }
    );
  }
}