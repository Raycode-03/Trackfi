import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resetPasswordSchema } from "@/lib/validations/auth_validation";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { password } = parsed.data;

    // Password validation is already handled by resetPasswordSchema

    const supabase = await createClient();

    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        {
          error:
            "Invalid or expired reset session. Please request a new reset link.",
        },
        { status: 401 },
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "Password updated successfully!",
    });
  } catch (err) {
    console.error("Error in new-password API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
