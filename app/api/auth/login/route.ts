import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userCredentialsSchema } from "@/lib/validations/auth_validation";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = userCredentialsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return NextResponse.json(
          {
            error:
              "Please verify your email before logging in. Check your inbox for the verification link.",
            code: "EMAIL_NOT_CONFIRMED",
          },
          { status: 401 },
        );
      }

      if (error) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
