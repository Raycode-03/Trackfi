import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
}