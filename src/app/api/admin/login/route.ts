import { NextRequest, NextResponse } from "next/server";
import { signAdminJWT, verifyPassword, hashToken } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handlerName, password } = body;

    if (!handlerName || !password) {
      return NextResponse.json(
        { error: "Handler name and password are required." },
        { status: 400 }
      );
    }

    // Verify password against env variable
    const isValid = await verifyPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = await signAdminJWT(handlerName.trim());

    // Log session to admin_sessions table
    try {
      const supabase = await createServiceClient();
      const hashedToken = await hashToken(token);
      const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

      await supabase.from("admin_sessions").insert({
        handler_name: handlerName.trim(),
        ip_address: ip,
        session_token_hash: hashedToken,
      });
    } catch (err) {
      // Non-critical — don't block login if audit log fails
      console.error("Failed to log admin session:", err);
    }

    // Set httpOnly cookie
    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
