import { handleAtlasStatesGet, handleAtlasStatesPost } from "./atlasStatesHandlers";
import { atlasApiErrorResponse } from "../atlasApiErrors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return await handleAtlasStatesGet(request);
  } catch (err) {
    console.error("[atlas/states GET]", err);
    return atlasApiErrorResponse(err, "Газрын зураг ачаалахад серверийн алдаа гарлаа.");
  }
}

export async function POST(request: Request) {
  try {
    return await handleAtlasStatesPost(request);
  } catch (err) {
    console.error("[atlas/states POST]", err);
    return atlasApiErrorResponse(err, "Шинэ улс хадгалахад серверийн алдаа гарлаа.");
  }
}
