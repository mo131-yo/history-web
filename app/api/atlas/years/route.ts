import { listAtlasYears } from "@/lib/db";

export async function GET() {
  const years = await listAtlasYears();
  return Response.json({ years });
}
