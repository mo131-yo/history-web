import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(req: Request) {
  try {
    const { yearData } = await req.json();

    const prompt = `
      Чи бол түүхийн багш. Дараах түүхэн GeoJSON өгөгдөл дээр үндэслэн 3 асуулттай сонирхолтой Quiz үүсгэ.
      Өгөгдөл: ${JSON.stringify(yearData)}

      Заавар:
      1. Асуулт бүр 3 сонголттой байна.
      2. 'coords' талбарт тухайн асуулттай холбоотой газар зүйн байршлыг [longitude, latitude] хэлбэрээр оруул. (Жишээ нь нийслэл хот эсвэл тулааны талбар)
      3. Зөвхөн Монгол хэлээр харилцана.
      
      JSON БҮТЭЦ:
      {
        "quizzes": [
          {
            "question": "асуулт",
            "options": ["хувилбар 1", "хувилбар 2", "хувилбар 3"],
            "correctAnswer": "сонгосон зөв хувилбар",
            "coords": [longitude, latitude]
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Чи бол түүхийн Quiz үүсгэгч туслах." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("AI Error");

    const parsedData = JSON.parse(content);
    return Response.json(parsedData.quizzes);

  } catch (error: any) {
    console.error("OpenAI Route Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}