// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const key = req.cookies.get("admin-key")?.value;
    if (key !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
}