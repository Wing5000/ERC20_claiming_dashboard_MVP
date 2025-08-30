import React from "react";

const LABELS = {
  1: "Ethereum",
  5: "Goerli",
  10: "Optimism",
  56: "BSC",
  97: "BSC Testnet",
  137: "Polygon",
  420: "Optimism Goerli",
  42161: "Arbitrum",
  421613: "Arbitrum Goerli",
  11155111: "Sepolia",
};

export default function NetworkBadge({ chainId }) {
  const label = chainId
    ? LABELS[Number(chainId)] || `Chain ${chainId}`
    : "No network";
  return (
    <span className="rounded-xl border border-black/10 bg-black/10 px-3 py-1.5 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
      {label}
    </span>
  );
}
