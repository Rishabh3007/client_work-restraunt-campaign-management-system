"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  created_at: string;
  registration_count: number;
  redemption_count: number;
}

interface GroupedCampaigns {
  active: Campaign[];
  scheduled: Campaign[];
  past: Campaign[];
  draft: Campaign[];
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<GroupedCampaigns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch("/api/admin/campaigns");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCampaigns(data);
      } catch {
        setError("Failed to load campaigns.");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-red">{error}</p>
      </div>
    );
  }

  const sections = [
    { key: "active" as const, label: "Active Campaigns", color: "brand-green" },
    {
      key: "scheduled" as const,
      label: "Scheduled Campaigns",
      color: "brand-yellow",
    },
    { key: "draft" as const, label: "Drafts", color: "brand-gray-400" },
    { key: "past" as const, label: "Past Campaigns", color: "brand-gray-400" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-white">Campaigns</h1>
        <button
          disabled
          className="px-4 py-2 bg-brand-gray-800 text-brand-gray-600 rounded-lg text-sm font-medium cursor-not-allowed"
          title="Coming soon"
        >
          + Create Campaign
        </button>
      </div>

      {sections.map(({ key, label, color }) => {
        const items = campaigns?.[key] || [];
        if (items.length === 0) return null;

        return (
          <div key={key} className="mb-8">
            <h2 className="text-sm font-semibold text-brand-gray-400 uppercase tracking-wider mb-3">
              {label}
            </h2>
            <div className="grid gap-3">
              {items.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() =>
                    router.push(`/admin/campaigns/${campaign.id}`)
                  }
                  className={`w-full text-left bg-brand-gray-900 border border-brand-gray-700 hover:border-brand-gray-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full bg-${color}`}
                        />
                        <h3 className="text-brand-white font-semibold group-hover:text-brand-yellow transition-colors truncate">
                          {campaign.name}
                        </h3>
                      </div>
                      {campaign.description && (
                        <p className="text-brand-gray-400 text-sm line-clamp-1 mb-3">
                          {campaign.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray-400">
                        <span>
                          {campaign.discount_type === "percentage"
                            ? `${campaign.discount_value}% off`
                            : `₹${campaign.discount_value} off`}
                        </span>
                        {campaign.availing_expiry && (
                          <span>
                            Expires{" "}
                            {new Date(
                              campaign.availing_expiry
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                        {campaign.max_registrations && (
                          <span>
                            Cap: {campaign.max_registrations}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 ml-4 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xl font-bold text-brand-white">
                          {campaign.registration_count}
                        </p>
                        <p className="text-xs text-brand-gray-400">
                          Registered
                        </p>
                      </div>
                      <div className="border-l border-brand-gray-700 pl-4 text-center">
                        <p className="text-xl font-bold text-brand-green">
                          {campaign.redemption_count}
                        </p>
                        <p className="text-xs text-brand-gray-400">Redeemed</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {campaigns &&
        Object.values(campaigns).every((arr) => arr.length === 0) && (
          <div className="text-center py-20">
            <p className="text-brand-gray-400">
              No campaigns yet. Create one to get started.
            </p>
          </div>
        )}
    </div>
  );
}
