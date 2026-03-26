import { createServiceClient } from "@/lib/supabase/server";
import { type Metadata } from "next";

import RegistrationForm from "./RegistrationForm";
import Logo from "../components/Logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exclusive Offers | One Bite",
  description: "Claim your exclusive discount at One Bite. Fresh food, bold flavours, unbeatable deals. Limited time registration for savings.",
};


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
  minimum_order_value: number | null;
  attention_text: string | null;
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
    <main className="min-h-dvh bg-brand-black flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        {/* ── Brand Header ── */}
        <div className="flex justify-center mb-4">
          <Logo className="w-32 sm:w-40 md:w-48" />
        </div>

        {/* ── Registration Form (Includes Campaign Card) ── */}
        <RegistrationForm campaign={campaign!} />

        {/* ── Footer Links ── */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-brand-gray-500 pb-8">
          <Link href="/menu" className="hover:text-brand-yellow transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brand-yellow rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            Menu
          </Link >
          <a href="https://chat.whatsapp.com/B4wgXAYSftQEqp2XSE1g9P?mode=gi_t" className="hover:text-brand-yellow transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brand-yellow rounded">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 0C5.385 0 0 5.386 0 12.032c0 2.122.553 4.195 1.605 6.01L.036 24l6.113-1.606A11.956 11.956 0 0 0 12.031 24c6.643 0 12.03-5.386 12.03-12.033C24.062 5.385 18.674 0 12.031 0Zm6.603 17.38c-.28.789-1.638 1.547-2.264 1.616-.626.069-1.398.172-3.837-.838-2.947-1.22-4.832-4.223-4.978-4.417-.146-.195-1.187-1.583-1.187-3.02 0-1.436.75-2.146 1.018-2.438.268-.293.585-.366.779-.366.195 0 .39 0 .56.01.17.01.402-.064.63.488.232.552.802 1.95 .874 2.1.073.146.122.316.024.512-.097.195-.146.317-.292.488-.146.17-.306.377-.439.524-.146.16-.307.332-.132.634.173.303.774 1.285 1.662 2.077 1.144 1.02 2.106 1.334 2.4 1.48.292.146.463.122.634-.073.17-.195.73-1.01 1.02-1.353.29-.344.582-.288.751-.197.17.091 1.094.516 1.281.611.186.096.31.146.356.223.045.077.045.45-.235 1.239Z" />
            </svg>
            WhatsApp
          </a>
          <a href="https://www.instagram.com/onebite_pimplesaudagar?igsh=MTVpMDBlNmtxa3RpNg==" className="hover:text-brand-yellow transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brand-yellow rounded">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            Instagram
          </a>
          <a href="https://maps.app.goo.gl/9icvvBCs7i5sYLu16?g_st=ic" className="hover:text-brand-yellow transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-brand-yellow rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            Google Maps
          </a>
        </div>
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
