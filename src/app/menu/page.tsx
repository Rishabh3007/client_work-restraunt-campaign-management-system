"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import menuData from "@/data/menu.json";
import Logo from "../components/Logo";

// Type definitions based on our JSON structure
type PriceType = number | string | { [key: string]: number | string };

interface MenuItem {
  name: string;
  description: string | null;
  price: PriceType;
  price2?: PriceType;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  note?: string;
  items: MenuItem[];
}

const MENU: { categories: MenuCategory[] } = menuData;

// --- Helper Functions ---

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(`(${escapeRegExp(highlight)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-brand-yellow text-brand-black rounded-[2px] px-[1px]">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// --- Renderers ---

function PriceView({ price, price2 }: { price: PriceType; price2?: PriceType }) {
  if (typeof price === "string") {
    return <span className="text-[0.88rem] font-bold text-brand-yellow font-sans">{price}</span>;
  }

  if (typeof price === "number") {
    return (
      <span className="text-[1rem] font-extrabold text-brand-yellow font-sans">
        <span className="text-[0.65rem] align-super mr-[1px]">₹</span>
        {price}
      </span>
    );
  }

  if (typeof price === "object" && price !== null) {
    const keys = Object.keys(price);

    return (
      <div className="flex flex-col gap-[2px] items-end font-sans">
        {keys.map((k) => (
          <div key={k} className="flex items-baseline gap-[6px]">
            <span className="text-[0.58rem] uppercase tracking-[0.07em] text-[#696565] min-w-[26px] text-right">
              {k}
            </span>
            <span className="text-[0.88rem] font-bold text-brand-yellow min-w-[30px] text-right">
              <span className="text-[0.58rem] align-super">₹</span>
              {price[k]}
            </span>
          </div>
        ))}
        {price2 && typeof price2 === "object" && (
          <>
            <div className="h-[2px]"></div>
            {Object.keys(price2).map((k) => (
              <div key={`p2-${k}`} className="flex items-baseline gap-[6px] opacity-65">
                <span className="text-[0.58rem] uppercase tracking-[0.07em] text-[#696565] min-w-[26px] text-right">
                  {k}
                </span>
                <span className="text-[0.78rem] font-bold text-brand-yellow min-w-[30px] text-right">
                  <span className="text-[0.58rem] align-super">₹</span>
                  {(price2 as Record<string, string | number>)[k]}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  return null;
}

function WaffleItemView({ item, isLast, highlight = "" }: { item: MenuItem; isLast: boolean; highlight?: string }) {
  const sizes = Object.keys(item.price); // Assumes single, double

  return (
    <>
      <div className="bg-brand-black py-[11px] px-4 flex items-center justify-between gap-[14px]">
        <div className="text-[0.875rem] font-semibold text-brand-white flex items-center gap-[6px] flex-1 min-w-0">
          <HighlightedText text={item.name} highlight={highlight} />
        </div>
        <div className="flex flex-col gap-[5px] items-end shrink-0 font-sans">
          <div className="flex items-center gap-[6px]">
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-[#696565]">
              Plain
            </span>
            <div className="flex gap-1">
              {sizes.map((k) => (
                <div key={k} className="flex items-baseline gap-[2px] bg-[#1c1c1c] border border-[#2a2a2a] rounded-md px-[7px] py-[3px]">
                  <span className="text-[0.52rem] uppercase tracking-[0.06em] text-[#696565] mr-[2px]">{k}</span>
                  <span className="text-[0.82rem] font-bold text-brand-yellow">
                    <span className="text-[0.52rem] align-super">₹</span>
                    {(item.price as Record<string, number>)[k]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {item.price2 && (
            <div className="flex items-center gap-[6px]">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.06em] text-[#3a7a96]">
                + Ice Cream
              </span>
              <div className="flex gap-1">
                {sizes.map((k) => (
                  <div key={k} className="flex items-baseline gap-[2px] bg-[#0c1e27] border border-[#1a3a4a] rounded-md px-[7px] py-[3px]">
                    <span className="text-[0.52rem] uppercase tracking-[0.06em] text-[#3a7a96] mr-[2px]">{k}</span>
                    <span className="text-[0.82rem] font-bold text-[#7dd4f8]">
                      <span className="text-[0.52rem] align-super">₹</span>
                      {(item.price2 as Record<string, number>)[k]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {!isLast && <div className="h-[1px] bg-[#1a1a1a] mx-4"></div>}
    </>
  );
}

function StandardItemView({
  item,
  isLast,
  highlight = "",
}: {
  item: MenuItem;
  isLast: boolean;
  highlight?: string;
}) {
  return (
    <>
      <div className="bg-brand-black py-[11px] px-4 flex items-center justify-between gap-[14px]">
        <div className="flex-1 min-w-0">
          <div className="text-[0.855rem] font-semibold text-brand-white leading-tight flex items-center gap-[6px]">
            <HighlightedText text={item.name} highlight={highlight} />
          </div>
          {item.description && (
            <div className="text-[0.7rem] text-[#999] leading-snug mt-[3px]">
              <HighlightedText text={item.description} highlight={highlight} />
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end">
          <PriceView price={item.price} price2={item.price2} />
        </div>
      </div>
      {!isLast && <div className="h-[1px] bg-[#1a1a1a] mx-4"></div>}
    </>
  );
}

// --- Main Page Component ---

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabId, setActiveTabId] = useState<string>(MENU.categories[0]?.id || "");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const tabBarRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialise intersection observer to spy on scroll sections
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.id;
            if (id) {
              setActiveTabId(id);
              // Scroll the tab into view
              const tabBtn = tabBarRef.current?.querySelector(`[data-id="${id}"]`);
              tabBtn?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
            }
          }
        });
      },
      {
        rootMargin: "-116px 0px -58% 0px", // Offset for header (58px) + tabs (50px) + some buffer
        threshold: 0,
      }
    );

    const sections = document.querySelectorAll(".menu-section");
    sections.forEach((el) => observerRef.current?.observe(el));

    // Scroll listener for top button
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleTabClick = (id: string) => {
    setActiveTabId(id);
    const sec = document.getElementById(`sec-${id}`);
    if (sec) {
      const offset = 58 + 50 + 4;
      window.scrollTo({
        top: sec.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const q = searchQuery.trim().toLowerCase();

  // Search results logic
  const searchHits = useMemo(() => {
    if (!q) return null;
    const hits: { cat: MenuCategory; item: MenuItem }[] = [];
    MENU.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          cat.name.toLowerCase().includes(q)
        ) {
          hits.push({ cat, item });
        }
      });
    });
    return hits;
  }, [q]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[58px] bg-brand-black border-b-[2px] border-brand-yellow flex items-center justify-between px-4 z-[200]">
        <div className="w-26">
          <Logo />
        </div>
        <div className="relative group">
          <svg
            className="absolute left-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] stroke-[#696565] fill-transparent stroke-2 pointer-events-none"
            viewBox="0 0 24 24"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu…"
            autoComplete="off"
            spellCheck="false"
            className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-[20px] text-brand-white text-[0.8rem] py-[7px] pr-[14px] pl-[32px] outline-none w-[140px] focus:w-[175px] focus:border-brand-yellow transition-all duration-300 appearance-none placeholder:text-[#696565]"
          />
        </div>
      </header>

      <nav
        ref={tabBarRef}
        className="fixed top-[58px] left-0 right-0 h-[50px] bg-[#141414] border-b border-[#1e1e1e] flex items-center overflow-x-auto gap-1 px-3 z-[190] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MENU.categories.map((cat) => (
          <button
            key={cat.id}
            data-id={cat.id}
            onClick={() => handleTabClick(cat.id)}
            className={`shrink-0 border rounded-[20px] text-[0.7rem] px-[11px] py-[5px] whitespace-nowrap transition-all duration-150 flex items-center gap-1 [-webkit-tap-highlight-color:transparent] ${activeTabId === cat.id
              ? "border-[#f5c518] bg-[#f5c518] text-black font-bold"
              : "border-[#252525] bg-transparent text-[#999] hover:text-white font-medium"
              }`}
          >
            <span className="text-[0.8rem]">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </nav>

      <main className="pt-[120px] pb-8 bg-brand-black min-h-dvh">
        {/* --- Standard Menu Layout --- */}
        {!searchHits && (
          <div id="menu-body">
            {MENU.categories.map((cat, catIdx) => (
              <section
                key={cat.id}
                id={`sec-${cat.id}`}
                data-id={cat.id}
                className="menu-section mb-[6px]"
              >
                <div className="sticky top-[107px] bg-[#141414] px-4 py-[9px] flex items-center gap-[9px] z-[100] border-l-[3px] border-brand-yellow">
                  <span className="text-[1.1rem] leading-none">{cat.icon}</span>
                  <span className="text-[0.85rem] font-extrabold tracking-[0.06em] uppercase text-brand-white">
                    {cat.name}
                  </span>
                  <span className="ml-auto text-[0.6rem] text-[#696565] tracking-[0.08em]">
                    {cat.items.length} items
                  </span>
                </div>
                {cat.note && (
                  <div className="text-[0.63rem] text-[#696565] px-4 pt-[5px] italic">
                    {cat.note}
                  </div>
                )}
                <div>
                  {cat.items.map((item, i) => {
                    const isLast = i === cat.items.length - 1;
                    if (cat.id === "waffle" && item.price2) {
                      return <WaffleItemView key={i} item={item} isLast={isLast} />;
                    }
                    return <StandardItemView key={i} item={item} isLast={isLast} />;
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* --- Search Results --- */}
        {searchHits && (
          <div className="pb-2">
            {searchHits.length === 0 ? (
              <>
                <div className="text-[0.65rem] tracking-[0.18em] uppercase text-[#696565] px-4 py-3">
                  No results for "{searchQuery}"
                </div>
                <div className="text-center py-16 px-5 text-[#696565] text-[0.85rem]">
                  <span className="text-[2.5rem] block mb-3">🔍</span>
                  Try a different keyword
                </div>
              </>
            ) : (
              <>
                <div className="text-[0.65rem] tracking-[0.18em] uppercase text-[#696565] px-4 py-3 pb-2">
                  {searchHits.length} result{searchHits.length > 1 ? "s" : ""} for "{searchQuery}"
                </div>
                <div>
                  {searchHits.map(({ cat, item }, i) => {
                    const isLast = i === searchHits.length - 1;

                    return (
                      <React.Fragment key={`${cat.id}-${i}`}>
                        <div className="bg-brand-black py-[11px] px-4 flex items-center justify-between gap-[14px]">
                          <div className="flex-1 min-w-0">
                            <div className="text-[0.855rem] font-semibold text-brand-white leading-tight flex items-center gap-[6px]">
                              <HighlightedText text={item.name} highlight={q} />
                            </div>
                            <div className="text-[0.7rem] leading-snug mt-[3px] pl-[15px] max-w-[95%]">
                              {item.description ? (
                                <span className="text-[#999]">
                                  <HighlightedText text={item.description} highlight={q} />
                                </span>
                              ) : (
                                <span className="text-[#696565]">
                                  {cat.icon} {cat.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 flex flex-col items-end">
                            <PriceView price={item.price} price2={item.price2} />
                          </div>
                        </div>
                        {!isLast && <div className="h-[1px] bg-[#1a1a1a] mx-4"></div>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        <footer className="text-center py-5 px-4 text-[0.6rem] tracking-[0.14em] uppercase text-[#696565] border-t border-[#1a1a1a] mt-8">
          <span className="text-brand-yellow font-bold">One Bite</span> &middot; Kiyu Foods &middot;
          All prices in ₹ &middot; Inclusive of taxes
        </footer>
      </main>

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-5 right-4 w-[42px] h-[42px] bg-brand-yellow rounded-full flex items-center justify-center z-[180] transition-all duration-300 shadow-[0_4px_20px_rgba(245,197,24,0.35)] [-webkit-tap-highlight-color:transparent] ${showScrollTop ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-3 invisible"
          }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-[18px] h-[18px] stroke-black fill-transparent stroke-[2.5px] stroke-linecap-round stroke-linejoin-round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

    </>
  );
}
