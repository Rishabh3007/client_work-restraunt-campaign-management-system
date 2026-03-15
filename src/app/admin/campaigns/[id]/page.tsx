"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  heard_from: string;
}

interface Registration {
  id: string;
  coupon_code: string;
  status: string;
  registered_at: string;
  availed_at: string | null;
  availed_by: string | null;
  notes: string | null;
  customers: Customer;
}

interface Campaign {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  discount_type: string;
  discount_value: number;
  availing_expiry: string | null;
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    perPage: 25,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("registered_at");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [availingId, setAvailingId] = useState<string | null>(null);
  const [confirmAvail, setConfirmAvail] = useState<Registration | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(pagination.page),
        perPage: String(pagination.perPage),
        search,
        status: statusFilter,
        sortBy,
        sortDir,
      });

      const res = await fetch(
        `/api/admin/campaigns/${campaignId}/registrations?${queryParams}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setRegistrations(data.registrations || []);
      setCampaign(data.campaign);
      setPagination(data.pagination);
    } catch {
      console.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  }, [campaignId, pagination.page, pagination.perPage, search, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleAvail(registration: Registration) {
    setAvailingId(registration.id);
    try {
      const res = await fetch(
        `/api/admin/registrations/${registration.id}/avail`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to mark as availed.");
        return;
      }

      // Refresh data
      await fetchRegistrations();
    } catch {
      alert("Network error.");
    } finally {
      setAvailingId(null);
      setConfirmAvail(null);
    }
  }

  function handleSort(column: string) {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  }

  function SortIcon({ column }: { column: string }) {
    if (sortBy !== column) return <span className="text-brand-gray-600 ml-1">↕</span>;
    return <span className="text-brand-yellow ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const isExpired =
    campaign?.availing_expiry &&
    new Date(campaign.availing_expiry) < new Date();

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin/campaigns")}
          className="text-brand-gray-400 hover:text-brand-white text-sm mb-2 inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
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
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to Campaigns
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-white">
              {campaign?.name || "Loading..."}
            </h1>
            {campaign && (
              <p className="text-brand-gray-400 text-sm mt-1">
                {campaign.discount_type === "percentage"
                  ? `${campaign.discount_value}% off`
                  : `₹${campaign.discount_value} off`}
                {campaign.availing_expiry && (
                  <span>
                    {" "}
                    · Valid until{" "}
                    {new Date(campaign.availing_expiry).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Export CSV */}
          <a
            href={`/api/admin/campaigns/${campaignId}/export`}
            className="px-4 py-2 bg-brand-gray-800 hover:bg-brand-gray-700 border border-brand-gray-700 text-brand-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
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
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Export CSV
          </a>
        </div>
      </div>

      {/* Toolbar: Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg bg-brand-gray-900 border border-brand-gray-700 px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-gray-600 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-colors outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-nowrap">
          {["all", "pending", "availed", "expired"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`whitespace-nowrap flex-shrink-0 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize ${
                statusFilter === s
                  ? "bg-brand-yellow text-brand-black"
                  : "bg-brand-gray-900 text-brand-gray-400 border border-brand-gray-700 hover:text-brand-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Per Page */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-brand-gray-400 text-sm">
          {pagination.total} registration{pagination.total !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-brand-gray-400">Show</span>
          {[25, 50].map((n) => (
            <button
              key={n}
              onClick={() => setPagination((p) => ({ ...p, perPage: n, page: 1 }))}
              className={`px-2.5 py-1 rounded text-sm cursor-pointer ${
                pagination.perPage === n
                  ? "bg-brand-yellow text-brand-black font-medium"
                  : "text-brand-gray-400 hover:text-brand-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gray-700 bg-brand-gray-800/50">
                <th className="text-left px-4 py-3 text-brand-gray-400 font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-brand-gray-400 font-medium">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-brand-gray-400 font-medium">
                  Mobile
                </th>
                <th
                  className="text-left px-4 py-3 text-brand-gray-400 font-medium cursor-pointer hover:text-brand-white select-none"
                  onClick={() => handleSort("registered_at")}
                >
                  Registered
                  <SortIcon column="registered_at" />
                </th>
                <th
                  className="text-left px-4 py-3 text-brand-gray-400 font-medium cursor-pointer hover:text-brand-white select-none"
                  onClick={() => handleSort("coupon_code")}
                >
                  Coupon
                  <SortIcon column="coupon_code" />
                </th>
                <th
                  className="text-left px-4 py-3 text-brand-gray-400 font-medium cursor-pointer hover:text-brand-white select-none"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <SortIcon column="status" />
                </th>
                <th
                  className="text-left px-4 py-3 text-brand-gray-400 font-medium cursor-pointer hover:text-brand-white select-none"
                  onClick={() => handleSort("availed_at")}
                >
                  Availed
                  <SortIcon column="availed_at" />
                </th>
                <th className="text-left px-4 py-3 text-brand-gray-400 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-brand-gray-400"
                  >
                    No registrations found.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-brand-gray-800 hover:bg-brand-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-brand-white font-medium whitespace-nowrap">
                      {reg.customers.full_name}
                    </td>
                    <td className="px-4 py-3 text-brand-gray-300 whitespace-nowrap">
                      {reg.customers.email}
                    </td>
                    <td className="px-4 py-3 text-brand-gray-300 whitespace-nowrap">
                      {reg.customers.mobile}
                    </td>
                    <td className="px-4 py-3 text-brand-gray-300 whitespace-nowrap">
                      {new Date(reg.registered_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-brand-yellow text-xs whitespace-nowrap">
                      {reg.coupon_code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge
                        status={reg.status}
                        availedAt={reg.availed_at}
                        availedBy={reg.availed_by}
                      />
                    </td>
                    <td className="px-4 py-3 text-brand-gray-300 whitespace-nowrap">
                      {reg.availed_at ? (
                        <div>
                          <p className="text-xs">
                            {new Date(reg.availed_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </p>
                          {reg.availed_by && (
                            <p className="text-xs text-brand-gray-400">
                              by {reg.availed_by}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-brand-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {reg.status === "pending" && !isExpired ? (
                        <button
                          onClick={() => setConfirmAvail(reg)}
                          disabled={availingId === reg.id}
                          className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green border border-brand-green/20 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {availingId === reg.id
                            ? "Processing..."
                            : "Mark Availed"}
                        </button>
                      ) : reg.status === "availed" ? (
                        <span className="px-3 py-1.5 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-lg text-xs font-medium inline-block">
                          Already Redeemed
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-brand-gray-800 text-brand-gray-400 border border-brand-gray-700 rounded-lg text-xs font-medium inline-block">
                          Expired
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-brand-gray-400 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
              }
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 bg-brand-gray-900 border border-brand-gray-700 text-brand-gray-300 rounded-lg text-sm disabled:opacity-30 hover:bg-brand-gray-800 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination((p) => ({
                  ...p,
                  page: Math.min(p.totalPages, p.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 bg-brand-gray-900 border border-brand-gray-700 text-brand-gray-300 rounded-lg text-sm disabled:opacity-30 hover:bg-brand-gray-800 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAvail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-gray-900 border border-brand-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-brand-white mb-2">
              Confirm Redemption
            </h3>
            <p className="text-brand-gray-300 text-sm mb-1">
              Mark coupon as redeemed for:
            </p>
            <p className="text-brand-white font-medium mb-1">
              {confirmAvail.customers.full_name}
            </p>
            <p className="text-brand-yellow font-mono text-sm mb-4">
              {confirmAvail.coupon_code}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAvail(null)}
                className="flex-1 px-4 py-2.5 bg-brand-gray-800 border border-brand-gray-700 text-brand-gray-300 rounded-lg text-sm font-medium hover:bg-brand-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAvail(confirmAvail)}
                disabled={availingId !== null}
                className="flex-1 px-4 py-2.5 bg-brand-green hover:bg-brand-green/80 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {availingId ? "Processing..." : "Confirm Availed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({
  status,
  availedAt,
  availedBy,
}: {
  status: string;
  availedAt: string | null;
  availedBy: string | null;
}) {
  if (status === "availed") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-medium"
        title={`Redeemed${availedAt ? ` on ${new Date(availedAt).toLocaleDateString("en-IN")}` : ""}${availedBy ? ` by ${availedBy}` : ""}`}
      >
        <span className="w-1.5 h-1.5 bg-brand-green rounded-full" />
        Availed
      </span>
    );
  }

  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-gray-800 text-brand-gray-400 rounded-full text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-brand-gray-400 rounded-full" />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-yellow/10 text-brand-yellow rounded-full text-xs font-medium">
      <span className="w-1.5 h-1.5 bg-brand-yellow rounded-full" />
      Pending
    </span>
  );
}
