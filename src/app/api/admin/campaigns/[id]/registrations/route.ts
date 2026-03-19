import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "25");
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const sortColumn = searchParams.get("sortBy") || "registered_at";
    const sortDir = searchParams.get("sortDir") || "desc";

    const supabase = await createServiceClient();

    // Build query - join registrations with customers
    let query = supabase
      .from("campaign_registrations")
      .select(
        `
        id,
        coupon_code,
        status,
        registered_at,
        availed_at,
        availed_by,
        notes,
        invoice,
        customers!inner (
          id,
          full_name,
          mobile,
          heard_from
        )
      `,
        { count: "exact" }
      )
      .eq("campaign_id", campaignId);

    // Status filter
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    // Search across customer fields and coupon code
    if (search) {
      // 1. Find matching customers (limit to 100 to avoid huge URLs)
      const { data: matchedCustomers } = await supabase
        .from("customers")
        .select("id")
        .or(`full_name.ilike.%${search}%,mobile.ilike.%${search}%`)
        .limit(100);

      const customerIds = (matchedCustomers || []).map((c) => c.id);

      // 2. Filter registrations where coupon_code matches OR customer is in the list
      let orQuery = `coupon_code.ilike.%${search}%`;
      if (customerIds.length > 0) {
        orQuery += `,customer_id.in.(${customerIds.join(",")})`;
      }

      query = query.or(orQuery);
    }

    // Sort
    const validColumns = [
      "registered_at",
      "coupon_code",
      "status",
      "availed_at",
    ];
    const sortCol = validColumns.includes(sortColumn)
      ? sortColumn
      : "registered_at";
    query = query.order(sortCol, {
      ascending: sortDir === "asc",
    });

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Registrations fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch registrations." },
        { status: 500 }
      );
    }

    // Also fetch campaign details
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    return NextResponse.json({
      registrations: data || [],
      campaign,
      pagination: {
        page,
        perPage,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / perPage),
      },
    });
  } catch (err) {
    console.error("Registrations API error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
