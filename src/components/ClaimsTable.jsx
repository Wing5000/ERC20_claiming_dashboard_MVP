import React, { useState, useMemo } from "react";

function shorten(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

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
        className="mb-2 w-full rounded border border-white/10 bg-white/10 px-2 py-1 text-sm text-zinc-200 placeholder-zinc-500"
      />
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-300">
            <th className="cursor-pointer px-2 py-1" onClick={() => requestSort("address")}>
              Address {sortIndicator("address")}
            </th>
            <th className="cursor-pointer px-2 py-1" onClick={() => requestSort("amount")}>
              Amount {sortIndicator("amount")}
            </th>
            <th className="cursor-pointer px-2 py-1" onClick={() => requestSort("time")}>
              Time {sortIndicator("time")}
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
                <td className="px-2 py-2 font-mono">{shorten(c.address)}</td>
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
          className="rounded border border-white/10 bg-white/10 px-3 py-1.5 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-zinc-400">
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="rounded border border-white/10 bg-white/10 px-3 py-1.5 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
