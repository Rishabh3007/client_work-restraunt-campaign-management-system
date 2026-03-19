import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateCouponCode } from "@/lib/coupon";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, mobile, heardFrom } = body;

    // ── Validate fields ──
    if (!fullName || !mobile || !heardFrom) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const mobileTrimmed = mobile.trim();

    if (!/^\d{10}$/.test(mobileTrimmed)) {
      return NextResponse.json(
        { error: "Mobile must be a 10-digit number." },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // ── 1. Find active campaign ──
    const { data: campaign, error: campaignErr } = await supabase
      .from("campaigns")
      .select("*")
      .eq("status", "active")
      .limit(1)
      .single();

    if (campaignErr || !campaign) {
      return NextResponse.json(
        { error: "No active campaign at the moment." },
        { status: 404 }
      );
    }

    // Check registration_expiry
    if (
      campaign.registration_expiry &&
      new Date(campaign.registration_expiry) < new Date()
    ) {
      return NextResponse.json(
        { error: "Registration for this campaign has closed." },
        { status: 410 }
      );
    }

    // ── 2. Check registration cap ──
    if (campaign.max_registrations) {
      const { count } = await supabase
        .from("campaign_registrations")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaign.id);

      if (count !== null && count >= campaign.max_registrations) {
        return NextResponse.json(
          { error: "This offer has been fully claimed!" },
          { status: 410 }
        );
      }
    }

    // ── 3. Check for existing customer by mobile ──
    const { data: existingCustomers } = await supabase
      .from("customers")
      .select("*")
      .eq("mobile", mobileTrimmed);

    let customer = existingCustomers && existingCustomers.length > 0
      ? existingCustomers[0]
      : null;
    const isReturningCustomer = !!customer;

    // ── 4. Check for existing registration on this campaign ──
    if (customer) {
      const { data: existingReg } = await supabase
        .from("campaign_registrations")
        .select("*")
        .eq("campaign_id", campaign.id)
        .eq("customer_id", customer.id)
        .single();

      if (existingReg) {
        // Already registered for this campaign
        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          isReturningCustomer: true,
          couponCode: existingReg.coupon_code,
          customerName: customer.full_name,
          campaign: {
            name: campaign.name,
            description: campaign.description,
            discountType: campaign.discount_type,
            discountValue: campaign.discount_value,
            availingExpiry: campaign.availing_expiry,
          },
          message: "You’ve already claimed this discount. Here’s your existing coupon code",
        });
      }
    }

    // ── 5. Create or use existing customer ──
    if (!customer) {
      const { data: newCustomer, error: insertErr } = await supabase
        .from("customers")
        .insert({
          full_name: fullName.trim(),
          mobile: mobileTrimmed,
          heard_from: heardFrom,
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Customer insert error:", insertErr);
        return NextResponse.json(
          { error: "Failed to register. Please try again." },
          { status: 500 }
        );
      }
      customer = newCustomer;
    }

    // ── 6. Generate unique coupon code (retry on collision) ──
    let couponCode = "";
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (attempts < MAX_ATTEMPTS) {
      couponCode = generateCouponCode(campaign.slug);

      const { data: existing } = await supabase
        .from("campaign_registrations")
        .select("id")
        .eq("coupon_code", couponCode)
        .single();

      if (!existing) break;
      attempts++;
    }

    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Failed to generate coupon. Please try again." },
        { status: 500 }
      );
    }

    // ── 7. Create campaign registration ──
    const { error: regErr } = await supabase
      .from("campaign_registrations")
      .insert({
        campaign_id: campaign.id,
        customer_id: customer.id,
        coupon_code: couponCode,
        status: "pending",
      });

    if (regErr) {
      console.error("Registration insert error:", regErr);
      return NextResponse.json(
        { error: "Failed to register. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyRegistered: false,
      isReturningCustomer,
      couponCode,
      customerName: customer.full_name,
      campaign: {
        name: campaign.name,
        description: campaign.description,
        discountType: campaign.discount_type,
        discountValue: campaign.discount_value,
        availingExpiry: campaign.availing_expiry,
      },
      message: isReturningCustomer
        ? "Welcome back! Here's your coupon for this campaign."
        : "You're registered! Here's your exclusive coupon.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
