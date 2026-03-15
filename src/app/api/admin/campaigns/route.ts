import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServiceClient();

    // Fetch all campaigns with registration and redemption counts
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Campaigns fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch campaigns." },
        { status: 500 }
      );
    }

    // Get counts for each campaign
    const campaignsWithCounts = await Promise.all(
      (campaigns || []).map(async (campaign) => {
        const { count: registrationCount } = await supabase
          .from("campaign_registrations")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", campaign.id);

        const { count: redemptionCount } = await supabase
          .from("campaign_registrations")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", campaign.id)
          .eq("status", "availed");

        return {
          ...campaign,
          registration_count: registrationCount || 0,
          redemption_count: redemptionCount || 0,
        };
      })
    );

    // Group by status
    const grouped = {
      active: campaignsWithCounts.filter((c) => c.status === "active"),
      scheduled: campaignsWithCounts.filter((c) => c.status === "scheduled"),
      past: campaignsWithCounts.filter((c) =>
        ["inactive", "expired"].includes(c.status)
      ),
      draft: campaignsWithCounts.filter((c) => c.status === "draft"),
    };

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("Campaigns API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
