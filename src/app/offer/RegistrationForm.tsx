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
    availing_expiry?: string | null;
    minimumOrderValue: number | null;
    minimum_order_value?: number | null;
    attentionText: string | null;
  };
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  discount_type: string;
  discount_value: number;
  minimum_order_value: number | null;
}

interface RegistrationFormProps {
  campaign: Campaign;
}

export default function RegistrationForm({ campaign }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    heardFrom: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    if (!isAgreed) {
      newErrors.isAgreed = "Please agree to the terms and conditions.";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* ── Active Offer Card ── */}
      <div className="bg-brand-gray-900 border border-brand-gray-700/50 rounded-2xl p-7 shadow-xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[0.65rem] font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-yellow"></span>
            </span>
            Exclusive Offer
          </div>
          <h2 className="text-2xl font-black text-brand-white mb-2 tracking-tight">
            {campaign.name}
          </h2>
          {campaign.description && (
            <p className="text-brand-gray-400 text-sm mb-6 max-w-[280px] mx-auto leading-relaxed">
              {campaign.description}
            </p>
          )}
          <div className="bg-brand-black/40 border border-brand-gray-800 rounded-2xl p-4 inline-block min-w-[160px] shadow-inner">
            <span className="text-4xl font-black text-brand-yellow tracking-tight">
              {campaign.discount_type === "percentage"
                ? `${campaign.discount_value}% OFF`
                : `₹${campaign.discount_value} OFF`}
            </span>
          </div>
        </div>
      </div>

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

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-brand-gray-700 bg-brand-gray-800 text-brand-yellow focus:ring-brand-yellow focus:ring-offset-brand-gray-900 transition-all cursor-pointer"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="terms" className="text-brand-gray-400 font-medium">
                I agree to{" "}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-brand-yellow hover:text-brand-yellow-dark transition-colors cursor-pointer hover:underline focus:outline-none"
                >
                  Terms and Conditions
                </button>
              </label>
              {errors.isAgreed && (
                <p className="text-brand-red text-[11px] mt-1 italic">{errors.isAgreed}</p>
              )}
            </div>
          </div>

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

      {/* Terms and Conditions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-3xl w-full max-w-lg shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gray-800">
              <h3 className="text-xl font-bold text-brand-yellow">Terms & Conditions</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-brand-gray-800 flex items-center justify-center text-brand-gray-400 hover:text-brand-white transition-all hover:bg-brand-gray-700 active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-brand-gray-700 scrollbar-track-transparent">
              <div className="space-y-4">
                <p className="text-brand-gray-300 text-sm leading-relaxed">
                  Please read and agree to the following terms and conditions to claim your offer:
                </p>
                <div className="bg-brand-black/30 rounded-2xl p-4 border border-brand-gray-800">
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-brand-gray-400 text-sm leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></div>
                      <span>The discount is subject to a valid mobile number which will be verified at the counter by our team.</span>
                    </li>
                    {campaign.minimum_order_value && (
                      <li className="flex gap-3 text-brand-gray-400 text-sm leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></div>
                        <span>Minimum order value to avail this offer is <span className="text-brand-white font-bold text-base italic ml-1 mb-1">₹{campaign.minimum_order_value}</span>.</span>
                      </li>
                    )}
                    <li className="flex gap-3 text-brand-gray-400 text-sm leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></div>
                      <span>By registering, you agree to receive future promotional offers, updates and marketing messages from One Bite via SMS/WhatsApp.</span>
                    </li>
                    <li className="flex gap-3 text-brand-gray-400 text-sm leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></div>
                      <span>This offer is unique to the registered mobile number and cannot be clubbed with any other ongoing promotions or discounts.</span>
                    </li>
                    <li className="flex gap-3 text-brand-gray-400 text-sm leading-relaxed">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-yellow shrink-0"></div>
                      <span>One Bite reserves the right to modify or terminate this offer at any time without prior notice.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-brand-gray-800 bg-brand-black/20">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsAgreed(checked);
                      if (checked) {
                        setTimeout(() => setIsModalOpen(false), 600);
                      }
                    }}
                    className="w-6 h-6 rounded-lg border-2 border-brand-gray-700 bg-brand-gray-800 text-brand-yellow focus:ring-brand-yellow transition-all group-hover:border-brand-yellow"
                  />
                </div>
                <span className="text-brand-white font-semibold text-base transition-colors group-hover:text-brand-yellow">
                  I agree to the Terms & Conditions
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
