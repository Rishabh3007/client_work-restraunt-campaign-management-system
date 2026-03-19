import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminJWT } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: registrationId } = await params;
    const body = await request.json().catch(() => ({}));
    const { invoice } = body;

    // Get handler name from JWT
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifyAdminJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = await createServiceClient();

    // Check if registration exists
    const { data: registration, error: fetchErr } = await supabase
      .from("campaign_registrations")
      .select("id")
      .eq("id", registrationId)
      .single();

    if (fetchErr || !registration) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 }
      );
    }

    // Update the invoice
    const { data: updated, error: updateErr } = await supabase
      .from("campaign_registrations")
      .update({
        invoice: invoice || null,
      })
      .eq("id", registrationId)
      .select()
      .single();

    if (updateErr) {
      console.error("Invoice update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update invoice." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, registration: updated });
  } catch (err) {
    console.error("Invoice API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
