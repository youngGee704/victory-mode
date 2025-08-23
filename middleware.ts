import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const normalizedPathname = pathname.replace(/\/$/, "") || "/"; // Ensure empty path is treated as "/"

  // Debug log to verify route
  console.log(`Middleware: Processing path: ${normalizedPathname}${search}`);

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/auth/callback",
    "/confirm",
    "/not-found",
  ];
  const publicApiRoutes = ["/api/auth"];

  // Explicitly allow homepage (/)
  if (normalizedPathname === "/") {
    console.log(`Middleware: Specifically allowing homepage: ${normalizedPathname}${search}`);
    return supabaseResponse;
  }

  // Explicitly allow /confirm
  if (normalizedPathname === "/confirm") {
    console.log(`Middleware: Specifically allowing /confirm with query: ${search}`);
    return supabaseResponse;
  }

  // Allow public routes and API routes
  if (
    publicRoutes.includes(normalizedPathname) ||
    publicApiRoutes.some((route) => normalizedPathname.startsWith(route))
  ) {
    console.log(`Middleware: Allowing public route: ${normalizedPathname}${search}`);
    return supabaseResponse;
  }

  // If not authenticated and trying to access protected route, redirect to login with query params preserved
  if (!user) {
    console.log(`Middleware: Redirecting to /login from: ${normalizedPathname}${search}`);
    return NextResponse.redirect(new URL(`/login${search}`, request.url));
  }

  console.log(`Middleware: Allowing authenticated route: ${normalizedPathname}${search}`);
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|manifest.json).*)"],
};