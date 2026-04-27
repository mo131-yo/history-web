import { listAtlasYears } from "@/lib/db";
import { atlasApiErrorResponse } from "../atlasApiErrors";

export async function GET() {
  try {
    const years = await listAtlasYears();
    return Response.json({ years });
  } catch (err) {
    console.error("[atlas/years GET]", err);
    return atlasApiErrorResponse(err, "Timeline ачаалахад серверийн алдаа гарлаа.");
  }
}
