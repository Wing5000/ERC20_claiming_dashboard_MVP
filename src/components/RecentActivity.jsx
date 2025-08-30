import React from "react";
import AddressBadge from "./AddressBadge.jsx";
import CopyButton from "./CopyButton.jsx";

function relativeTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentActivity({ claims = [] }) {
  const items = [...claims].sort((a, b) => b.time - a.time).slice(0, 5);

  if (items.length === 0) {
    return <div className="mt-6 text-sm text-zinc-400">No recent activity.</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="mb-2 text-lg font-semibold">Recent Activity</h3>
      <ul className="space-y-2 text-sm text-zinc-200">
        {items.map((tx, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <AddressBadge address={tx.address} />
              <CopyButton value={tx.address} />
            </div>
            <span>{tx.amount}</span>
            <span className="text-xs text-zinc-400">{relativeTime(tx.time)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
