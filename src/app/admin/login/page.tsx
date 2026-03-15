"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [handlerName, setHandlerName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!handlerName.trim() || !password) {
      setError("Both fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handlerName: handlerName.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/admin/campaigns");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-brand-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-yellow tracking-tight">
            ONE BITE
          </h1>
          <p className="text-brand-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-8 shadow-xl space-y-4"
        >
          <h2 className="text-lg font-semibold text-brand-white pb-2 border-b border-brand-gray-700 mb-4">Sign In</h2>

          <div>
            <label
              htmlFor="handlerName"
              className="block text-sm font-medium text-brand-gray-300 mb-1.5"
            >
              Handler Name
            </label>
            <input
              type="text"
              id="handlerName"
              value={handlerName}
              onChange={(e) => setHandlerName(e.target.value)}
              className="w-full rounded-lg bg-brand-gray-800 border border-brand-gray-700 px-4 py-3 text-brand-white placeholder:text-brand-gray-600 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-colors outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brand-gray-300 mb-1.5"
            >
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-brand-gray-800 border border-brand-gray-700 px-4 py-3 text-brand-white placeholder:text-brand-gray-600 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-colors outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3">
              <p className="text-brand-red text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-bold text-base py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
