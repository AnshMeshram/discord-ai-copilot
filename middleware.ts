import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PROTECTED_PATHS = ["/dashboard", "/instructions", "/channels", "/memory"];
const PUBLIC_AUTH_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const requestUrl = request.nextUrl.clone();
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Avoid throwing inside middleware; log and continue without auth checks.
    // On Vercel ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    // (or `SUPABASE_URL` / `SUPABASE_ANON_KEY`) are configured in Environment Variables.
    console.error("Supabase env vars missing for middleware:", {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
    });
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((p) => path.startsWith(p));
  const isAuthPage = PUBLIC_AUTH_PATHS.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    requestUrl.pathname = "/login";
    return NextResponse.redirect(requestUrl);
  }

  if (isAuthPage && user) {
    requestUrl.pathname = "/dashboard";
    return NextResponse.redirect(requestUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
