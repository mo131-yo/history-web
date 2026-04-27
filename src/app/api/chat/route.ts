import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, historyContext } = await req.json();

    const contextStr = historyContext
      ? `Хэрэглэгч одоо **${historyContext.name ?? "нэргүй нутаг"}** нутаг дэвсгэрийг харж байна.${
          historyContext.year ? ` Цаг үе: **${historyContext.year}**.` : ""
        }${historyContext.color ? ` Өнгөний кодлол: ${historyContext.color}.` : ""}${
          historyContext.description ? ` Тайлбар: ${historyContext.description}` : ""
        }`
      : "Хэрэглэгч Монгол Атласын ерөнхий харагдацыг үзэж байна.";

    const systemPrompt = `Чи бол Монгол эзэнт гүрэн болон Евроазийн дундад зууны түүхийн мэргэжилтэн, академик эрдэмтэн. Хэрэглэгч интерактив түүхийн атлас үзэж байна.

    ${contextStr}

    ДАГАЖ МӨРДӨХ ЗАРЧМУУД:
    1. Хариулт нь товч (150-300 үг), академик боловч сонирхолтой, уншихад хялбар байна.
    2. Чухал он цагийг **тод** харуулна: **1206 он**, **XIII зуун**, гэх мэт.
    3. Газарзүйн нэр, овог нэрийг анхны хэлбэрээр нь бичнэ (Хубилай, Темүжин, Каракорум гэх мэт).
    4. Хэрэгтэй бол хоёр талыг харьцуулна.
    5. What-if / таамаглал асуувал тодорхой "Хэрвээ... байсан бол..." хэлбэрээр хариулна.
    6. Монгол уламжлал, нүүдэлчдийн соёлын хэтийн төлөвийг хүндэтгэн авч үзнэ.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      stream: true,
      max_tokens: 600,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              const data = JSON.stringify({ delta: { text: content } });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("OpenAI API алдаа:", error);
    return Response.json({ error: "AI алдаа гарлаа" }, { status: 500 });
  }
}