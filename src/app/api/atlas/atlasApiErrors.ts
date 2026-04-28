const CONNECTION_ERROR_CODES = new Set(["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"]);

export function atlasApiErrorResponse(error: unknown, fallbackMessage: string) {
  const isConnectionError = hasConnectionError(error);

  return Response.json(
    {
      error: isConnectionError
        ? "Өгөгдлийн сантай холбогдож чадсангүй. DATABASE_URL болон Neon сүлжээний холболтоо шалгаад дахин оролдоно уу."
        : fallbackMessage,
    },
    { status: isConnectionError ? 503 : 500 },
  );
}

function hasConnectionError(error: unknown, seen = new Set<unknown>()): boolean {
  if (!error || typeof error !== "object" || seen.has(error)) return false;
  seen.add(error);

  const record = error as Record<string, unknown>;
  if (typeof record.code === "string" && CONNECTION_ERROR_CODES.has(record.code)) return true;
  if (typeof record.hostname === "string" && record.hostname.includes("neon.tech")) return true;
  if (typeof record.message === "string" && /fetch failed|error connecting to database/i.test(record.message)) return true;

  return hasConnectionError(record.cause, seen) || hasConnectionError(record.sourceError, seen);
}
