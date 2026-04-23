import { forgotPasswordSchema } from "@/lib/validations/auth_validation";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const supabase = await createClient();
    const { data: user, error: staffError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email);
    console.log("User lookup result:", { user, email, staffError });
    if (staffError || !user) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 404 },
      );
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/new-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Password reset link sent to your email." },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error in forgot-password API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
