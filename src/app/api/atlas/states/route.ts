import { handleAtlasStatesGet, handleAtlasStatesPost } from "./atlasStatesHandlers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return await handleAtlasStatesGet(request);
  } catch (err) {
    console.error("[atlas/states GET]", err);
    return Response.json({ error: "Газрын зураг ачаалахад серверийн алдаа гарлаа." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    return await handleAtlasStatesPost(request);
  } catch (err) {
    console.error("[atlas/states POST]", err);
    return Response.json({ error: "Шинэ улс хадгалахад серверийн алдаа гарлаа." }, { status: 500 });
  }
}
