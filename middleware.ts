import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const nextIntlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const localizedAdminMatch = pathname.match(/^\/(fa|en)(\/admin(?:\/.*)?)$/);
  if (localizedAdminMatch) {
    // مسیرهای قدیمیِ دارای زبان به آدرس رسمی بدون پیشوند منتقل می‌شوند.
    return NextResponse.redirect(
      new URL(`${localizedAdminMatch[2]}${request.nextUrl.search}`, request.url),
    );
  }
  if (/^\/admin(?:\/.*)?$/.test(pathname)) {
    const requestedLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const locale = requestedLocale === "en" || requestedLocale === "fa"
      ? requestedLocale
      : routing.defaultLocale;
    // آدرس عمومی بدون زبان می‌ماند و فقط برای حفظ Provider فعلی بازنویسی می‌شود.
    return NextResponse.rewrite(
      new URL(`/${locale}${pathname}${request.nextUrl.search}`, request.url),
    );
  }
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/fa", request.url));
  }
  // اجازه بده next-intl ادامه بده کارشو
  return nextIntlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
