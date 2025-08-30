import React from "react";

export default function EligibilityInfo({ status, eligibleAmount }) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-zinc-300">Status: {status}</div>
      <div className="mt-1 text-sm text-zinc-300">Eligible amount: {eligibleAmount}</div>
    </div>
  );
}
