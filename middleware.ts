import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // اگه مسیر اصلی هست، ریدایرکت کن به زبان پیش‌فرض (مثلاً fa)
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(`/${routing.defaultLocale}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
