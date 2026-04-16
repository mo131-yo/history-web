import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, historyContext } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Чи бол түүхийн мэргэжилтэн, эрдэмтэн. Хэрэглэгч интерактив түүхийн атлас үзэж байна. 
          Одоогийн нөхцөл: ${JSON.stringify(historyContext)}.
          
          ЗААВАР:
          1. Хариулт нь товч бөгөөд утга төгс, академик боловч сонирхолтой байна.
          2. Хэрэв тодорхой улсыг сонгосон бол тухайн улсын байр сууринаас эсвэл бодит түүхэн баримтаас хариул.
          3. Түүхэн он сарыг тод харуулж (Жишээ нь: **1206 он**), чухал нэр томъёог онцлон бич.
          4. Хэтэрхий нуршуу биш, "Claude" шиг шууд гол утгыг хариулна.
          5. Хэрэв What-if горим идэвхтэй байгаа бол (alternate гэсэн түлхүүр үг орсон бол) тэрхүү таамаглалд тулгуурлаж хариул.`
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.8,
    });

    return Response.json({ text: response.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: "AI Error" }, { status: 500 });
  }
}