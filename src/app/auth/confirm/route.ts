import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  if (!code) {
    const errorUrl = new URL("/register", request.url);

    errorUrl.searchParams.set(
      "error",
      "Email confirmation failed. No confirmation code was received.",
    );

    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "Email confirmation exchange error:",
      error.message,
    );

    const errorUrl = new URL("/register", request.url);

    errorUrl.searchParams.set(
      "error",
      `Email confirmation failed: ${error.message}`,
    );

    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(
    new URL("/dashboard", request.url),
  );
}