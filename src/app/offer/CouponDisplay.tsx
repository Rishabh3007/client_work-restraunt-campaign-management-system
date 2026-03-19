"use client";

import { useState } from "react";

interface CouponDisplayProps {
  result: {
    couponCode: string;
    customerName: string;
    alreadyRegistered: boolean;
    isReturningCustomer: boolean;
    message: string;
    campaign: {
      name: string;
      description: string;
      discountType: string;
      discountValue: number;
      availingExpiry: string | null;
    };
  };
}

export default function CouponDisplay({ result }: CouponDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = result.couponCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Returning customer / already registered banner */}
      {result.isReturningCustomer && (
        <div
          className={`rounded-xl p-4 border ${result.alreadyRegistered
            ? "bg-brand-yellow/5 border-brand-yellow/20"
            : "bg-brand-green/5 border-brand-green/20"
            }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${result.alreadyRegistered
                ? "bg-brand-yellow/10"
                : "bg-brand-green/10"
                }`}
            >
              {result.alreadyRegistered ? (
                <svg
                  className="w-4 h-4 text-brand-yellow"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-brand-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p
                className={`text-sm font-medium ${result.alreadyRegistered
                    ? "text-brand-yellow"
                    : "text-brand-green"
                  }`}
              >
                {result.alreadyRegistered
                  ? "Already Registered!"
                  : `Welcome back, ${result.customerName}!`}
              </p>
              <p className="text-xs text-brand-gray-400 mt-0.5">
                {result.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main coupon card */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl overflow-hidden">
        {/* Success header */}
        <div className="bg-brand-yellow/5 border-b border-brand-gray-700 px-6 py-4 text-center">
          <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-brand-yellow/10 ring-1 ring-brand-yellow/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-brand-yellow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          {!result.isReturningCustomer && (
            <p className="text-brand-gray-300 text-sm">{result.message}</p>
          )}
        </div>

        {/* Coupon code section */}
        <div className="px-6 py-6">
          <p className="text-brand-gray-400 text-xs uppercase tracking-wider text-center mb-2">
            Your Coupon Code
          </p>
          <div className="bg-brand-black border-2 border-dashed border-brand-yellow/50 shadow-inner rounded-xl p-4 text-center mb-4 animate-glow">
            <p className="text-2xl sm:text-3xl font-bold text-brand-yellow tracking-widest font-mono break-all">
              {result.couponCode}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-brand-gray-800 hover:bg-brand-gray-700 border border-brand-gray-700 text-brand-white font-medium py-3 rounded-lg transition-all duration-200 cursor-pointer"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 text-brand-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                </svg>
                Copy Code
              </>
            )}
          </button>

          {/* Campaign details */}
          <div className="mt-4 text-center space-y-1">
            <p className="text-brand-gray-300 text-sm">
              <span className="font-medium text-brand-white">
                {result.campaign.name}
              </span>{" "}
              —{" "}
              {result.campaign.discountType === "percentage"
                ? `${result.campaign.discountValue}% off`
                : `₹${result.campaign.discountValue} off`}
            </p>
            {result.campaign.availingExpiry && (
              <p className="text-brand-gray-400 text-xs">
                Valid until{" "}
                {new Date(result.campaign.availingExpiry).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-brand-gray-800/50 border-t border-brand-gray-700 px-6 py-4 text-center">
          <p className="text-brand-gray-400 text-xs">
            Show this code at the counter to claim your discount.
          </p>
        </div>
      </div>
    </div>
  );
}
