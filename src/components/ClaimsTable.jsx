import React, { useState, useMemo } from "react";
import AddressBadge from "./AddressBadge.jsx";
import CopyButton from "./CopyButton.jsx";

export default function ClaimsTable({ claims = [] }) {
  const [sortConfig, setSortConfig] = useState({ key: "time", direction: "desc" });
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const pageSize = 10;

  const sortedClaims = useMemo(() => {
    const lower = filter.toLowerCase();
    const filtered = lower
      ? claims.filter((c) => c.address.toLowerCase().includes(lower))
      : claims;
    const sorted = [...filtered];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [claims, filter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedClaims.length / pageSize));
  const pageData = sortedClaims.slice((page - 1) * pageSize, page * pageSize);

  const requestSort = (key) => {
    setSortConfig((prev) => {
      let direction = "asc";
      if (prev.key === key && prev.direction === "asc") direction = "desc";
      return { key, direction };
    });
  };

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="mt-6">
      <input
        type="text"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(1);
        }}
        placeholder="Filter by address"
        aria-label="Filter by address"
        className="mb-2 w-full rounded border border-white/10 bg-white/10 px-2 py-1 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/30"
      />
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-300">
            <th
              scope="col"
              aria-sort={
                sortConfig.key === "address"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className="px-2 py-1"
            >
              <button
                type="button"
                onClick={() => requestSort("address")}
                className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Address {sortIndicator("address")}
              </button>
            </th>
            <th
              scope="col"
              aria-sort={
                sortConfig.key === "amount"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className="px-2 py-1"
            >
              <button
                type="button"
                onClick={() => requestSort("amount")}
                className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Amount {sortIndicator("amount")}
              </button>
            </th>
            <th
              scope="col"
              aria-sort={
                sortConfig.key === "time"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className="px-2 py-1"
            >
              <button
                type="button"
                onClick={() => requestSort("time")}
                className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Time {sortIndicator("time")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-4 text-center text-zinc-400">
                No claims.
              </td>
            </tr>
          ) : (
            pageData.map((c, idx) => (
              <tr key={idx} className="border-t border-white/10">
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <AddressBadge address={c.address} />
                    <CopyButton value={c.address} />
                  </div>
                </td>
                <td className="px-2 py-2">{c.amount}</td>
                <td className="px-2 py-2">{new Date(c.time).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-200">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded border border-white/10 bg-white/10 px-3 py-1.5 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Previous
        </button>
        <span className="text-zinc-400">
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded border border-white/10 bg-white/10 px-3 py-1.5 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
