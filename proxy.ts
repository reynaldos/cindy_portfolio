import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, validSession } from "@/lib/session";

// /admin/* needs a valid session cookie; the login page is the one exception
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (validSession(request.cookies.get(COOKIE)?.value)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = { matcher: ["/admin/:path*"] };
