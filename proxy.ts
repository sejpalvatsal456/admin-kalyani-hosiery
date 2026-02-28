import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = [
    "/",
    "/brand",
    "/category",
    "/subcategory",
    "/product",
    "/addProduct",
    "/editProduct",
    "/popular-products",
    "/sale-products",
    "/sale-popular-products",
    "/reels-banner",
  ];

  const needsAuth = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!needsAuth) return NextResponse.next();

  // Basic protection: require presence of the token cookie.
  // Full verification happens server-side in API routes (jwt libs may not be available in the Edge runtime).
  const token = req.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/brand",
    "/category",
    "/subcategory",
    "/product",
    "/addProduct",
    "/editProduct/:path*",
    "/popular-products",
    "/sale-products",
    "/sale-popular-products",
    "/reels-banner",
  ],
};
