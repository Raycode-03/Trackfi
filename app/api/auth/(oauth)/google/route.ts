import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: `${request.nextUrl.origin}/callback`,
    },
  });
  

  if (error) {
    console.error("GitHub OAuth error:", error);

    return NextResponse.redirect(
      new URL(`/auth-error?message=${encodeURIComponent(error.message)}`, request.url)
    );
  }
  return NextResponse.redirect(data.url);

}