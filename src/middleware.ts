import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_EIRA, tokenEiraValido } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (await tokenEiraValido(req.cookies.get(COOKIE_EIRA)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login-eira";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/eira/:path*"] };
