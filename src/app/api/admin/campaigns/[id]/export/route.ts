import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    const supabase = await createServiceClient();

    // Fetch campaign name
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("name, slug")
      .eq("id", campaignId)
      .single();

    // Fetch all registrations with customer data
    const { data, error } = await supabase
      .from("campaign_registrations")
      .select(
        `
        coupon_code,
        status,
        registered_at,
        availed_at,
        availed_by,
        notes,
        customers!inner (
          full_name,
          email,
          mobile,
          heard_from
        )
      `
      )
      .eq("campaign_id", campaignId)
      .order("registered_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to export data." },
        { status: 500 }
      );
    }

    // Build CSV
    const headers = [
      "Name",
      "Email",
      "Mobile",
      "Heard From",
      "Coupon Code",
      "Status",
      "Registered At",
      "Availed At",
      "Availed By",
      "Notes",
    ];

    const rows = (data || []).map((reg) => {
      const customer = reg.customers as unknown as {
        full_name: string;
        email: string;
        mobile: string;
        heard_from: string;
      };
      return [
        customer.full_name,
        customer.email,
        customer.mobile,
        customer.heard_from || "",
        reg.coupon_code,
        reg.status,
        reg.registered_at,
        reg.availed_at || "",
        reg.availed_by || "",
        reg.notes || "",
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const filename = `${campaign?.slug || "campaign"}-registrations.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
