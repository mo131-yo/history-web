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






import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getCachedInsight, setCachedInsight } from "@/lib/db";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const bodySchema = z.object({
  year: z.number().int(),
  slug: z.string().min(1),
  state: z.object({
    name: z.string(),
    leader: z.string(),
    capital: z.string(),
    summary: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json({ error: "Insight хүсэлтийн өгөгдөл буруу байна." }, { status: 400 });
  }

  const { year, slug, state } = parsed.data;

  // Cache шалгах
  const cached = await getCachedInsight(year, slug);
  if (cached) {
    return Response.json({ text: cached, cached: true });
  }

  // Claude API-аар шинээр үүсгэх
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system:
        "Чи бол Монголын болон Төв Азийн дундад зууны түүх тайлбарлагч. 3 хэсэгтэй, товч, бодитой, ойлгомжтой Монгол хэлээр хариул. Хэт урт биш, user-facing atlas sidebar-д багтахуйц бич.",
      messages: [
        {
          role: "user",
          content: `Он: ${year}
Улс: ${state.name}
Удирдагч: ${state.leader}
Нийслэл: ${state.capital}
Товч түүх: ${state.summary}
Нэмэлт metadata: ${JSON.stringify(state.metadata ?? {})}

Дараах бүтэцтэй богино markdown тайлбар бич:
1. Яагаад энэ жил чухал байсан бэ
2. Хөрш улсуудтай нь ямар харилцаатай байсан бэ
3. Энэ зураг дээрх хилийг харахад юуг анзаарах вэ`,
        },
      ],
    });

    const text =
      message.content[0]?.type === "text"
        ? message.content[0].text
        : "AI тайлбар одоогоор үүссэнгүй.";

    // DB-д cache хийх
    await setCachedInsight(year, slug, text); 

    return Response.json({ text, cached: false });
  } catch (error) {
    console.error("Atlas insight error", error);
    return Response.json({ error: "AI тайлбар үүсгэх үед алдаа гарлаа." }, { status: 500 });
  }
}