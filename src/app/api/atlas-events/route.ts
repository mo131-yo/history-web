import { getAtlasEventsForYear } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawYear = searchParams.get("year");
    const year = Number.parseInt(rawYear ?? "", 10);

    if (!Number.isInteger(year) || year < 1100 || year > 1400) {
      return Response.json(
        { error: "Зөв year параметр дамжуулна уу." },
        { status: 400 }
      );
    }

    return Response.json(await getAtlasEventsForYear(year));
  } catch (error) {
    console.error("[atlas-events GET]", error);
    return Response.json(
      { error: "Түүхэн үйл явдлыг ачаалахад серверийн алдаа гарлаа." },
      { status: 500 }
    );
  }
}
