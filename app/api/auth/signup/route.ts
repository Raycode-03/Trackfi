import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { emailQueue } from "@/lib/queues/emailQueue";
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

    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("id")
      .eq("email", email)
      .single();
    if (staff) {
      return NextResponse.json(
        { error: "Please check your credentials" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signup error:", error);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user?.email) {
      try {
        await emailQueue.add("send-welcome-email", {
          email: data.user.email,
          name: data.user.user_metadata?.full_name || "",
        });
      } catch (queueError) {
        console.error("Email queue failed:", queueError);
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      email: data.user?.email,
    });
  } catch (err) {
    console.error("Signup route error:", err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signup failed" },
      { status: 500 },
    );
  }
}
