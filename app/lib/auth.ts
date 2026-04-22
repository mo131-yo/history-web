import { NextRequest } from "next/server";

export function checkAdminAuth(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_SECRET_KEY;
}