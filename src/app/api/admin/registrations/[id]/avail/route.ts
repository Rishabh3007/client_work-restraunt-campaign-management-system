import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminJWT } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: registrationId } = await params;

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

    // Fetch registration with campaign info
    const { data: registration, error: fetchErr } = await supabase
      .from("campaign_registrations")
      .select(
        `
        *,
        campaigns!inner (
          availing_expiry
        )
      `
      )
      .eq("id", registrationId)
      .single();

    if (fetchErr || !registration) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 }
      );
    }

    // Check if already availed
    if (registration.status === "availed") {
      return NextResponse.json(
        {
          error: "This coupon has already been redeemed.",
          availed_at: registration.availed_at,
          availed_by: registration.availed_by,
        },
        { status: 409 }
      );
    }

    // Check if expired
    const campaign = registration.campaigns as { availing_expiry: string | null };
    if (
      campaign.availing_expiry &&
      new Date(campaign.availing_expiry) < new Date()
    ) {
      return NextResponse.json(
        { error: "This coupon has expired." },
        { status: 410 }
      );
    }

    if (registration.status === "expired") {
      return NextResponse.json(
        { error: "This coupon has expired." },
        { status: 410 }
      );
    }

    // Mark as availed
    const { data: updated, error: updateErr } = await supabase
      .from("campaign_registrations")
      .update({
        status: "availed",
        availed_at: new Date().toISOString(),
        availed_by: payload.handlerName,
      })
      .eq("id", registrationId)
      .select()
      .single();

    if (updateErr) {
      console.error("Avail update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to mark as availed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, registration: updated });
  } catch (err) {
    console.error("Avail API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
