// import OpenAI from "openai";
// import { z } from "zod";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY,
// });

// const bodySchema = z.object({
//   year: z.number().int(),
//   state: z.object({
//     name: z.string(),
//     leader: z.string(),
//     capital: z.string(),
//     summary: z.string(),
//     metadata: z.record(z.string(), z.unknown()).optional(),
//   }),
// });

// export async function POST(request: Request) {
//   const payload = await request.json();
//   const parsed = bodySchema.safeParse(payload);

//   if (!parsed.success) {
//     return Response.json({ error: "Insight хүсэлтийн өгөгдөл буруу байна." }, { status: 400 });
//   }

//   try {
//     const response = await openai.responses.create({
//       model: "gpt-4o-mini",
//       input: [
//         {
//           role: "system",
//           content: [
//             {
//               type: "input_text",
//               text: "Чи бол Монголын болон Төв Азийн дундад зууны түүх тайлбарлагч. 3 хэсэгтэй, товч, бодитой, ойлгомжтой Монгол хэлээр хариул. Хэт урт биш, user-facing atlas sidebar-д багтахуйц бич.",
//             },
//           ],
//         },
//         {
//           role: "user",
//           content: [
//             {
//               type: "input_text",
//               text: `Он: ${parsed.data.year}
// Улс: ${parsed.data.state.name}
// Удирдагч: ${parsed.data.state.leader}
// Нийслэл: ${parsed.data.state.capital}
// Товч түүх: ${parsed.data.state.summary}
// Нэмэлт metadata: ${JSON.stringify(parsed.data.state.metadata ?? {})}

// Дараах бүтэцтэй богино markdown тайлбар бич:
// 1. Яагаад энэ жил чухал байсан бэ
// 2. Хөрш улсуудтай нь ямар харилцаатай байсан бэ
// 3. Энэ зураг дээрх хилийг харахад юуг анзаарах вэ`,
//             },
//           ],
//         },
//       ],
//     });

//     return Response.json({
//       text: response.output_text || "AI тайлбар одоогоор үүссэнгүй.",
//     });
//   } catch (error) {
//     console.error("Atlas insight error", error);
//     return Response.json({ error: "AI тайлбар үүсгэх үед алдаа гарлаа." }, { status: 500 });
//   }
// }



import { getCachedInsight, saveInsight } from "@/lib/db-insight";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, slug, state } = body as {
      year: number;
      slug: string;
      state: {
        name: string;
        leader: string;
        capital: string;
        summary: string;
        metadata?: Record<string, unknown>;
      };
    };

    if (!slug || !year || !state?.name) {
      return NextResponse.json({ error: "slug, year, state.name шаардлагатай." }, { status: 400 });
    }

    const cached = await getCachedInsight(slug, year);
    if (cached) {
      return NextResponse.json({ text: cached, cached: true });
    }

    const periodName = state.metadata?.periodName
      ? ` (тухайн үеийн нэр: «${String(state.metadata.periodName)}»)`
      : "";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "Та дундад зууны Монгол болон Төв Азийн түүхийн мэргэжилтэн. Монгол хэлээр богино, гүн гүнзгий түүхэн тайлбар бичдэг.",
        },
        {
          role: "user",
          content: `Доорх улс/нутаг дэвсгэрийн талаар МОНГОЛ хэлээр богино, гүн гүнзгий түүхэн тайлбар бич.

## Мэдээлэл
- Нэр: ${state.name}${periodName}
- Он: ${year} он
- Удирдагч: ${state.leader}
- Нийслэл: ${state.capital}
- Товч тойм: ${state.summary}

## Шаардлага
- 3–5 богино догол мөр бич
- Тухайн он, удирдагч, стратегийн байршлыг дурдаарай
- Дундад зууны нарийн нэр томьёо, он цаг хэрэглэ
- Тухайн улсын эрх мэдэл, дайн байлдаан, худалдаа эсвэл ач холбогдлын талаар нэмэлт мэдлэг нэм
- Markdown ашиглаж болно (**bold**, ## heading г.м.)
- Хэт урт бүү бич (400 үгнээс хэтрэхгүй)`,
        },
      ],
    });

    const text =
      completion.choices[0]?.message?.content?.trim() || "Тайлбар олдсонгүй.";

    await saveInsight(slug, year, text);

    return NextResponse.json({ text, cached: false });
  } catch (err) {
    console.error("[insight]", err);
    return NextResponse.json({ error: "Серверийн алдаа." }, { status: 500 });
  }
}