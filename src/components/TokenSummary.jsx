import React from "react";
import NetworkBadge from "./NetworkBadge.jsx";

const EXPLORERS = {
  1: "https://etherscan.io",
  5: "https://goerli.etherscan.io",
  10: "https://optimistic.etherscan.io",
  56: "https://bscscan.com",
  97: "https://testnet.bscscan.com",
  137: "https://polygonscan.com",
  420: "https://goerli-optimism.etherscan.io",
  42161: "https://arbiscan.io",
  421613: "https://goerli.arbiscan.io",
  11155111: "https://sepolia.etherscan.io",
};

export default function TokenSummary({ tokenAddress, name, symbol, progress = 0, chainId }) {
  const explorerBase = chainId ? EXPLORERS[Number(chainId)] : null;

  const handleCopy = () => {
    if (tokenAddress) {
      navigator?.clipboard?.writeText(tokenAddress);
    }
  };

  const shortAddr = tokenAddress ? `${tokenAddress.slice(0, 6)}…${tokenAddress.slice(-4)}` : "";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          {symbol && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200">
              {symbol}
            </span>
          )}
        </div>
        {chainId && <NetworkBadge chainId={chainId} />}
      </div>

      {tokenAddress && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{shortAddr}</span>
          <button
            onClick={handleCopy}
            className="rounded border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Copy
          </button>
          {explorerBase && (
            <a
              href={`${explorerBase}/address/${tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline"
            >
              Explorer
            </a>
          )}
        </div>
      )}

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
