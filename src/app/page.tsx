import Image from "next/image";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import homeHighlights from "@/data/home-highlights.json";
import Logo from "./components/Logo";

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
      <header className="fixed top-0 left-0 right-0 h-[64px] bg-[#0d0d0dc0] backdrop-blur-md border-b border-[#222] flex items-center justify-between px-6 z-[200]">
        <Logo className="w-24" />
        <nav className="flex gap-4">
          <Link
            href="/menu"
            className="text-brand-gray-300 hover:text-brand-yellow text-sm font-semibold transition-colors uppercase tracking-widest"
          >
            Menu
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-[64px] flex flex-col">
        {/* ── Hero Section ── */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 py-18 sm:py-32 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1a05] via-brand-black to-brand-black">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-brand-yellow via-[#fff4b3] to-brand-yellow-dark drop-shadow-sm mb-4 leading-none italic">
              ONE BITE
            </h1>
            <p className="text-brand-gray-300 text-lg sm:text-lg md:text-xl font-medium tracking-wide mb-10 max-w-lg leading-relaxed">
              Satiate Your Crave For Hunger. Bold flavours, fresh ingredients, and unforgettable experiences.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
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
            </div>
          </div>
        </section>

        {/* ── Active Offer Banner ── */}
        {hasActiveOffer && (
          <section className="px-4 py-6 -mt-10 relative z-20 max-w-4xl mx-auto w-full">
            <div className="bg-gradient-to-r from-brand-gray-900 via-[#1a1810] to-brand-gray-900 border border-brand-yellow/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(245,197,24,0.1),_transparent_60%)] pointer-events-none"></div>
              <div className="flex-1 text-center sm:text-left relative z-10">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[0.65rem] font-bold uppercase tracking-wider mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                  </span>
                  Limited Time Offer
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
                  {campaign.name}
                </h3>
                <p className="text-brand-gray-300 text-sm">
                  {campaign.discount_type === "percentage"
                    ? `Get ${campaign.discount_value}% OFF your next order.`
                    : `Get ₹${campaign.discount_value} OFF your next order.`}
                </p>
              </div>
              <Link
                href="/offer"
                className="relative z-10 shrink-0 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-brand-yellow transition-colors shadow-lg active:scale-95"
              >
                Claim Offer Now
              </Link>
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
      <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] pt-16 pb-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-12">
          {/* Brand Info */}
          <div className="md:w-1/3 flex flex-col">
            <div className="w-30 pb-1">
              <Logo />
            </div>
            <p className="text-[#888] text-sm leading-relaxed mb-6 max-w-sm">
              We serve the most delicious fast food with fresh ingredients. Drop by for an unforgettable experience.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/onebite_pimplesaudagar?igsh=MTVpMDBlNmtxa3RpNg==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#ccc] hover:bg-brand-yellow hover:text-black hover:border-brand-yellow transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a href="https://chat.whatsapp.com/B4wgXAYSftQEqp2XSE1g9P?mode=gi_t" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#ccc] hover:bg-brand-yellow hover:text-black hover:border-brand-yellow transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.014 8.00613C6.12827 7.1024 7.30277 5.87414 8.23488 6.01043L8.23339 6.00894C9.14051 6.18132 9.85859 7.74261 10.2635 8.44465C10.5504 8.95402 10.3641 9.4701 10.0965 9.68787C9.7355 9.97883 9.17099 10.3803 9.28943 10.7834C9.5 11.5 12 14 13.2296 14.7107C13.695 14.9797 14.0325 14.2702 14.3207 13.9067C14.5301 13.6271 15.0466 13.46 15.5548 13.736C16.3138 14.178 17.0288 14.6917 17.69 15.27C18.0202 15.546 18.0977 15.9539 17.8689 16.385C17.4659 17.1443 16.3003 18.1456 15.4542 17.9421C13.9764 17.5868 8 15.27 6.08033 8.55801C5.97237 8.24048 5.99955 8.12044 6.014 8.00613Z" ></path> <path fillRule="evenodd" clipRule="evenodd" d="M12 23C10.7764 23 10.0994 22.8687 9 22.5L6.89443 23.5528C5.56462 24.2177 4 23.2507 4 21.7639V19.5C1.84655 17.492 1 15.1767 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23ZM6 18.6303L5.36395 18.0372C3.69087 16.4772 3 14.7331 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C11.0143 21 10.552 20.911 9.63595 20.6038L8.84847 20.3397L6 21.7639V18.6303Z" ></path> </g></svg>
              </a>
              <a href="https://www.facebook.com/share/1bW8qfHQvj/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#ccc] hover:bg-brand-yellow hover:text-black hover:border-brand-yellow transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
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
