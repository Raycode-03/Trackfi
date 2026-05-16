import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { userCredentialsSchema } from "@/lib/validations/auth_validation";
import { applyRateLimit } from "@/lib/helpers/applyRateLimit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await applyRateLimit(req, true);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = userCredentialsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const supabase = await createClient();

    // single profile fetch
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, failed_attempts, locked_until")
      .eq("email", email)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // check lock
    if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
      return NextResponse.json({ error: "Account locked, try again later" }, { status: 423 });
    }

    // single login attempt
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return NextResponse.json(
          { error: "Please verify your email before logging in.", code: "EMAIL_NOT_CONFIRMED" },
          { status: 401 }
        );
      }

      // increment failed attempts
      const attempts = profile.failed_attempts + 1;
      await supabase.from("profiles").update({
        failed_attempts: attempts,
        locked_until: attempts >= 3
          ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
          : null,
      }).eq("id", profile.id);

      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // success — reset
    await supabase.from("profiles").update({
      failed_attempts: 0,
      locked_until: null,
    }).eq("id", profile.id);

    return NextResponse.json({ success: true, user: data.user });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
