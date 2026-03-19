"use client";

import { useState } from "react";
import CouponDisplay from "./CouponDisplay";

const HEARD_FROM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google" },
  { value: "word_of_mouth", label: "Friend / Word of Mouth" },
  { value: "flyer", label: "Flyer / Poster" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Other" },
];

interface RegistrationResult {
  couponCode: string;
  customerName: string;
  customerMobile: string;
  alreadyRegistered: boolean;
  isReturningCustomer: boolean;
  message: string;
  campaign: {
    name: string;
    description: string;
    discountType: string;
    discountValue: number;
    availingExpiry: string | null;
    minimumOrderValue: number | null;
    attentionText: string | null;
  };
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    heardFrom: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<RegistrationResult | null>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.heardFrom) {
      newErrors.heardFrom = "Please select how you heard about us.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Show coupon result ──
  if (result) {
    return <CouponDisplay result={result} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-7 shadow-lg space-y-4">
        <h3 className="text-lg font-semibold text-brand-white mb-1">
          Claim Your Coupon
        </h3>

        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-brand-gray-300 mb-1.5"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full rounded-lg bg-brand-gray-800 border border-brand-gray-700 px-4 py-3 text-base text-brand-white placeholder:text-brand-gray-600 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-colors outline-none"
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="text-brand-red text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Mobile */}
        <div>
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-brand-gray-300 mb-1.5"
          >
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobile"
            value={formData.mobile}
            onChange={(e) =>
              setFormData({ ...formData, mobile: e.target.value })
            }
            className="w-full rounded-lg bg-brand-gray-800 border border-brand-gray-700 px-4 py-3 text-base text-brand-white placeholder:text-brand-gray-600 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-colors outline-none"
            placeholder="10-digit number"
            maxLength={10}
          />
          {errors.mobile && (
            <p className="text-brand-red text-xs mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* Heard From */}
        <div>
          <label
            htmlFor="heardFrom"
            className="block text-sm font-medium text-brand-gray-300 mb-1.5"
          >
            How did you hear about us?
          </label>
          <select
            id="heardFrom"
            value={formData.heardFrom}
            onChange={(e) =>
              setFormData({ ...formData, heardFrom: e.target.value })
            }
            className="w-full rounded-lg bg-brand-gray-800 border border-brand-gray-700 px-4 py-3 text-base text-brand-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-colors outline-none appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select an option
            </option>
            {HEARD_FROM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.heardFrom && (
            <p className="text-brand-red text-xs mt-1">{errors.heardFrom}</p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg px-4 py-3">
            <p className="text-brand-red text-sm">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-base font-bold py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Claiming...
            </span>
          ) : (
            "Claim My Coupon"
          )}
        </button>
      </div>
    </form>
  );
}
