import { createServiceClient } from "@/lib/supabase/server";
import RegistrationForm from "./RegistrationForm";

export const dynamic = "force-dynamic";

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  discount_type: string;
  discount_value: number;
  max_registrations: number | null;
  registration_expiry: string | null;
  availing_expiry: string | null;
}

async function getActiveCampaign(): Promise<{
  campaign: Campaign | null;
  state: "active" | "no_campaign" | "registration_closed" | "fully_claimed";
}> {
  const supabase = await createServiceClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "active")
    .limit(1)
    .single();

  if (!campaign) {
    return { campaign: null, state: "no_campaign" };
  }

  // Check registration expiry
  if (
    campaign.registration_expiry &&
    new Date(campaign.registration_expiry) < new Date()
  ) {
    return { campaign, state: "registration_closed" };
  }

  // Check max registrations
  if (campaign.max_registrations) {
    const { count } = await supabase
      .from("campaign_registrations")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaign.id);

    if (count !== null && count >= campaign.max_registrations) {
      return { campaign, state: "fully_claimed" };
    }
  }

  return { campaign, state: "active" };
}

export default async function OfferPage() {
  const { campaign, state } = await getActiveCampaign();

  if (state === "no_campaign") {
    return <HoldingScreen />;
  }

  if (state === "registration_closed") {
    return <ClosedScreen campaignName={campaign!.name} />;
  }

  if (state === "fully_claimed") {
    return <FullyClaimedScreen campaignName={campaign!.name} />;
  }

  return (
    <main className="min-h-dvh bg-brand-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* ── Brand Header ── */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-yellow tracking-tight">
            ONE BITE
          </h1>
          <p className="text-brand-gray-400 text-sm mt-1">
            Satiate Your Crave For Hunger
          </p>
        </div>

        {/* ── Campaign Card ── */}
        <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-8 shadow-lg mb-6">
          <div className="text-center">
            <span className="inline-block bg-brand-yellow/10 text-brand-yellow text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Exclusive Offer
            </span>
            <h2 className="text-2xl font-bold text-brand-white mb-2">
              {campaign!.name}
            </h2>
            {campaign!.description && (
              <p className="text-brand-gray-300 text-sm mb-4">
                {campaign!.description}
              </p>
            )}
            <div className="bg-brand-black/50 rounded-xl p-4 inline-block">
              <span className="text-4xl font-extrabold text-brand-yellow">
                {campaign!.discount_type === "percentage"
                  ? `${campaign!.discount_value}% OFF`
                  : `₹${campaign!.discount_value} OFF`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Registration Form ── */}
        <RegistrationForm />

        {/* ── Footer ── */}
        <p className="text-center text-brand-gray-600 text-xs mt-6">
          By registering, you agree to receive promotional offers from One Bite.
        </p>
      </div>
    </main>
  );
}

/* ────────────────────────────────────────── */
/*  Status screens                            */
/* ────────────────────────────────────────── */

function HoldingScreen() {
  return (
    <main className="min-h-dvh bg-brand-black flex items-center justify-center px-4 py-6">
      <div className="text-center max-w-sm">
        <h1 className="text-4xl font-bold text-brand-yellow tracking-tight mt-1 mb-2">
          ONE BITE
        </h1>
        <p className="text-brand-gray-400 text-sm mb-8">
          Satiate Your Crave For Hunger
        </p>
        <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-10 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-gray-800 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-brand-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-brand-white mb-2">
            No Active Offers
          </h2>
          <p className="text-brand-gray-400 text-sm">
            We&apos;re cooking up something exciting. Check back soon for
            exclusive deals!
          </p>
        </div>
      </div>
    </main>
  );
}

function ClosedScreen({ campaignName }: { campaignName: string }) {
  return (
    <main className="min-h-dvh bg-brand-black flex items-center justify-center px-4 py-6">
      <div className="text-center max-w-sm">
        <h1 className="text-4xl font-bold text-brand-yellow tracking-tight mt-1 mb-2">
          ONE BITE
        </h1>
        <p className="text-brand-gray-400 text-sm mb-8">
          Satiate Your Crave For Hunger
        </p>
        <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-10 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-red/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-brand-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-brand-white mb-2">
            Registration Closed
          </h2>
          <p className="text-brand-gray-400 text-sm">
            <span className="text-brand-yellow font-medium">{campaignName}</span>{" "}
            is no longer accepting new registrations. Stay tuned for future offers!
          </p>
        </div>
      </div>
    </main>
  );
}

function FullyClaimedScreen({ campaignName }: { campaignName: string }) {
  return (
    <main className="min-h-dvh bg-brand-black flex items-center justify-center px-4 py-6">
      <div className="text-center max-w-sm">
        <h1 className="text-4xl font-bold text-brand-yellow tracking-tight mt-1 mb-2">
          ONE BITE
        </h1>
        <p className="text-brand-gray-400 text-sm mb-8">
          Satiate Your Crave For Hunger
        </p>
        <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-10 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-yellow/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-brand-yellow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-brand-white mb-2">
            Offer Fully Claimed!
          </h2>
          <p className="text-brand-gray-400 text-sm">
            All coupons for{" "}
            <span className="text-brand-yellow font-medium">{campaignName}</span>{" "}
            have been claimed. Follow us for upcoming deals!
          </p>
        </div>
      </div>
    </main>
  );
}
