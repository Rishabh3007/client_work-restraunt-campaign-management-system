import Image from "next/image";
import Link from "next/link";
import { type Metadata } from "next";

import { createServiceClient } from "@/lib/supabase/server";
import homeHighlights from "@/data/home-highlights.json";
import Logo from "./components/Logo";
import Navbar from "./components/Navbar";
import SocialIcons from "./components/SocialIcons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "One Bite | Kiyu Foods",
  description: "Satiate your crave for hunger at One Bite (Kiyu Foods). Explore our delicious menu in Pimple Saudagar. Fresh food, bold flavours.",
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

export default async function HomePage() {
  const { campaign, state } = await getActiveCampaign();
  const hasActiveOffer = state === "active" && campaign;

  return (
    <div className="bg-brand-black min-h-dvh flex flex-col font-sans text-brand-white selection:bg-brand-yellow selection:text-brand-black">
      {/* ── Navbar ── */}
      <Navbar />

      <main className="flex-1 flex flex-col relative">
        {/* ── Hero Section ── */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 pb-10 pt-16 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1a05] via-brand-black to-brand-black w-full min-h-[350px]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-brand-yellow via-[#fff4b3] to-brand-yellow-dark drop-shadow-sm mb-4 leading-none italic">
              ONE BITE
            </h1>
            <p className="text-brand-gray-300 text-lg sm:text-lg md:text-xl font-medium tracking-wide max-w-lg leading-relaxed">
              Satiate Your Crave For Hunger. Bold flavours, fresh ingredients, and unforgettable experiences.
            </p>

            {!hasActiveOffer && <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/menu"
                className="group relative px-8 py-4 bg-brand-yellow text-brand-black font-extrabold text-sm uppercase tracking-widest rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,197,24,0.3)] hover:shadow-[0_0_30px_rgba(245,197,24,0.5)] flex items-center gap-2"
              >
                <span className="relative z-10">Explore Menu</span>
                <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                <div className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </Link>
            </div>}
          </div>
        </section>

        {/* ── Active Offer Banner ── */}
        {hasActiveOffer && (
          <section className="px-4 py-8 -mt-14 relative z-20 max-w-4xl mx-auto w-full group">
            <div className="bg-gradient-to-br from-[#1a1810] via-brand-black to-[#1a1810] border-2 border-brand-yellow/50 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_0_40px_rgba(245,197,24,0.15)] flex flex-col sm:flex-row items-center justify-between gap-8 overflow-hidden relative animate-glow transition-all hover:scale-[1.01]">
              {/* Shimmer Sweep Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-yellow/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

              {/* Background Decoration */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,197,24,0.15),transparent_70%)] pointer-events-none"></div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-yellow/5 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="flex-1 text-center sm:text-left relative z-10 w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-yellow text-brand-black text-[0.7rem] font-black uppercase tracking-[0.1em] mb-4 shadow-[0_2px_10px_rgba(245,197,24,0.3)]">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-black opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-black"></span>
                  </span>
                  Limited Time Offer
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight leading-tight italic">
                  {campaign.name}
                </h3>

                <p className="text-brand-yellow-light/90 text-sm sm:text-base font-medium max-w-md">
                  {campaign.discount_type === "percentage"
                    ? `Get ${campaign.discount_value}% OFF your next order.`
                    : `Get ₹${campaign.discount_value} OFF your next order.`}
                </p>
              </div>

              <div className="relative z-10 shrink-0 w-full sm:w-auto">
                <Link
                  href="/offer"
                  className="relative flex items-center justify-center gap-3 px-6 py-3 bg-brand-yellow text-brand-black font-black text-sm uppercase tracking-[0.15em] rounded-2xl hover:bg-white transition-all shadow-[0_10px_25px_rgba(245,197,24,0.3)] hover:shadow-[0_15px_35px_rgba(245,197,24,0.5)] active:scale-95 group/btn overflow-hidden"
                >
                  <span className="relative text-lg z-10">Claim Now</span>
                  <svg className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Featured Menu Grid ── */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Featured Signatures</h2>
            <p className="text-brand-gray-400 text-sm tracking-wide max-w-lg mx-auto">
              Discover our most loved dishes, crafted with perfection and served hot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {homeHighlights.map((item) => (
              <div key={item.id} className="group flex flex-col bg-brand-gray-900 border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-brand-yellow/50 transition-colors shadow-xl h-full">
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#111]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={item.id === "burger" || item.id === "pizza"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{item.name}</h3>
                    <p className="text-brand-gray-300 text-xs sm:text-sm font-medium line-clamp-2 drop-shadow-sm">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-[#141414] border-t border-[#222] mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] text-[#888] uppercase tracking-wider font-semibold mb-0.5">Starting from</span>
                    <span className="text-xl font-black text-brand-yellow">₹{item.startingPrice}</span>
                  </div>
                  <Link
                    href={`/menu`}
                    className="w-10 h-10 rounded-full bg-[#222] text-white flex items-center justify-center group-hover:bg-brand-yellow group-hover:text-black transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#333] hover:border-brand-yellow text-[#ccc] hover:text-white rounded-full font-bold uppercase tracking-widest text-xs transition-all hover:bg-brand-yellow/5"
            >
              View Full Menu
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* ── Elevated Footer ── */}
      <footer id="contact" className="bg-[#0a0a0a] border-t border-[#1a1a1a] pt-16 pb-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-12">
          {/* Brand Info */}
          <div className="md:w-1/3 flex flex-col">
            <div className="w-30 pb-1">
              <Logo />
            </div>
            <p className="text-[#888] text-sm leading-relaxed mb-6 max-w-sm">
              We serve the most delicious fast food with fresh ingredients. Drop by for an unforgettable experience.
            </p>
            <SocialIcons
              containerClassName="flex gap-4"
              linkClassName="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#ccc] hover:bg-brand-yellow hover:text-black hover:border-brand-yellow transition-all"
              iconClassName="w-5 h-5"
            />
          </div>

          {/* Quick Links */}
          <div className="md:w-1/4 flex flex-col">
            <h4 className="text-white font-bold mb-5 tracking-wide uppercase text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/menu" className="text-[#888] hover:text-brand-yellow font-medium text-sm transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-brand-yellow rounded-full"></div> Our Menu</Link></li>
              <li><Link href="/offer" className="text-[#888] hover:text-brand-yellow font-medium text-sm transition-colors flex items-center gap-2"><div className="w-1 h-1 bg-brand-yellow rounded-full"></div> Special Offers</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:w-1/3 flex flex-col">
            <h4 className="text-white font-bold mb-5 tracking-wide uppercase text-sm">Find Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="text-[#ccc] text-sm font-medium">One Bite Restaurant</span>
                  <span className="text-[#888] text-xs">Shop no 4, Sai Saheb, Shiv Sai Ln, Pimple Saudagar, Pimpri-Chinchwad, Pune, Maharashtra 411027</span>
                  <a href="https://maps.app.goo.gl/9icvvBCs7i5sYLu16?g_st=ic" className="text-brand-yellow text-xs font-semibold hover:underline mt-1 w-max">View on Google Maps</a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-yellow shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.614c.11.459-.052.932-.413 1.256L5.47 10.158A15.006 15.006 0 0 0 13.842 18.53l1.185-1.185a1.5 1.5 0 0 1 1.256-.413l4.614 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                </svg>
                <span className="text-[#ccc] text-sm">+91 80555 20599</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a] pt-8 text-center">
          <p className="text-[#666] text-xs font-medium">&copy; {new Date().getFullYear()} One Bite | Kiyu Foods. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
