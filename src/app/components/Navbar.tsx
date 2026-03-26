'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import SocialIcons from './SocialIcons';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleContactClick = () => {
    if (isHome) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      window.location.href = "/#contact";
    }
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] bg-[#0d0d0dc0] backdrop-blur-md border-b border-[#222] flex items-center justify-between px-6 z-[200]">
      <div className="flex items-center">
        <Logo className="w-24" />
      </div>

      {/* Desktop Links & Socials */}
      <div className="hidden md:flex items-center gap-8">
        <nav className="flex items-center gap-8 border-r border-[#333] pr-8">
          <Link
            href="/menu"
            className="text-brand-gray-300 hover:text-brand-yellow text-sm font-semibold transition-colors uppercase tracking-[0.15em]"
          >
            Menu
          </Link>
          <button
            onClick={handleContactClick}
            className="text-brand-gray-300 hover:text-brand-yellow text-sm font-semibold transition-colors uppercase tracking-[0.15em] cursor-pointer"
          >
            Contact Us
          </button>
        </nav>
        <SocialIcons containerClassName="flex items-center gap-4" />
      </div>

      {/* Mobile Interaction Area */}
      <div className="flex md:hidden items-center gap-4">
        {/* Menu link visible at all times as requested */}
        <Link
          href="/menu"
          className="text-brand-gray-300 hover:text-brand-yellow text-[0.7rem] font-bold transition-colors uppercase tracking-widest"
        >
          Menu
        </Link>

        {/* Hamburger Dropdown Trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`text-brand-gray-300 hover:text-brand-yellow flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 transition-all ${isOpen ? 'bg-brand-yellow/10 border-brand-yellow/30' : ''}`}
            aria-label="Toggle Navigation"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          {/* Mobile Dropdown Panel */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-brand-black border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-[200] animate-in fade-in zoom-in-95 duration-150 origin-top-right flex flex-col">
              <div className="py-1">
                <button
                  onClick={handleContactClick}
                  className="w-full text-left px-5 py-4 text-brand-gray-300 hover:bg-brand-gray-800 hover:text-brand-yellow text-xs font-bold transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </button>
              </div>
              <SocialIcons containerClassName="border-t border-white/10 p-4 bg-[#141414] flex items-center justify-center gap-5" linkClassName="text-[#888] hover:text-brand-yellow transition-colors" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
