"use client";

import { useRouter, usePathname } from "next/navigation";
import Logo from "../components/Logo";

export default function AdminShell({
  children,
  handlerName,
}: {
  children: React.ReactNode;
  handlerName: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't wrap the login page in the admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-brand-black">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-brand-gray-900/95 backdrop-blur-sm border-b border-brand-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-24" />
            <span className="text-brand-gray-600 text-xs">|</span>
            <a
              href="/admin/campaigns"
              className={`text-sm font-medium transition-colors ${pathname === "/admin/campaigns"
                ? "text-brand-white"
                : "text-brand-gray-400 hover:text-brand-white"
                }`}
            >
              Campaigns
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-brand-gray-400 text-sm">
              Logged in as{" "}
              <span className="text-brand-white font-medium">
                {handlerName}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-brand-gray-400 hover:text-brand-red transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
