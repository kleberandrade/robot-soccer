import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale, localizedPath } from "./i18n/config";
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const originHost = request.headers.get("host") ?? request.nextUrl.host;
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    /\.[a-z0-9]+$/i.test(pathname)
  )
    return NextResponse.next();
  const segment = pathname.split("/")[1];
  if (!isLocale(segment)) {
    const saved = request.cookies.get("rs-locale")?.value;
    const url = request.nextUrl.clone();
    url.host = originHost;
    url.pathname = localizedPath(
      pathname,
      isLocale(saved) ? saved : defaultLocale,
    );
    return NextResponse.redirect(url);
  }
  const headers = new Headers(request.headers);
  headers.set("x-rs-locale", segment);
  headers.set("x-rs-path", pathname);
  const response = NextResponse.next({ request: { headers } });
  response.cookies.set("rs-locale", segment, {
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 31536000,
  });
  return response;
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
