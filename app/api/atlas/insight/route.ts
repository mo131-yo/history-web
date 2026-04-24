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