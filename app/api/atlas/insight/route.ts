import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const bodySchema = z.object({
  year: z.number().int(),
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

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Чи бол Монголын болон Төв Азийн дундад зууны түүх тайлбарлагч. 3 хэсэгтэй, товч, бодитой, ойлгомжтой Монгол хэлээр хариул. Хэт урт биш, user-facing atlas sidebar-д багтахуйц бич.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Он: ${parsed.data.year}
Улс: ${parsed.data.state.name}
Удирдагч: ${parsed.data.state.leader}
Нийслэл: ${parsed.data.state.capital}
Товч түүх: ${parsed.data.state.summary}
Нэмэлт metadata: ${JSON.stringify(parsed.data.state.metadata ?? {})}

Дараах бүтэцтэй богино markdown тайлбар бич:
1. Яагаад энэ жил чухал байсан бэ
2. Хөрш улсуудтай нь ямар харилцаатай байсан бэ
3. Энэ зураг дээрх хилийг харахад юуг анзаарах вэ`,
            },
          ],
        },
      ],
    });

    return Response.json({
      text: response.output_text || "AI тайлбар одоогоор үүссэнгүй.",
    });
  } catch (error) {
    console.error("Atlas insight error", error);
    return Response.json({ error: "AI тайлбар үүсгэх үед алдаа гарлаа." }, { status: 500 });
  }
}
