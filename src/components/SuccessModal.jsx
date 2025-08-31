import React from "react";
import CopyButton from "./CopyButton.jsx";

export default function SuccessModal({ txHash, chainId, onClose, onInvite = () => {} }) {
  const explorers = {
    1: "https://etherscan.io",
    5: "https://goerli.etherscan.io",
    11155111: "https://sepolia.etherscan.io",
  };
  const base = explorers[chainId] || "https://etherscan.io";
  const url = `${base}/tx/${txHash}`;
  const shortHash = txHash ? `${txHash.slice(0, 6)}…${txHash.slice(-4)}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-white">Claim successful</h2>
        <div className="mb-4 flex items-center justify-center gap-2 break-all text-sm text-zinc-300">
          <span>{shortHash}</span>
          <CopyButton value={txHash} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Open in explorer
          </a>
          <button
            onClick={onInvite}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Invite to claim
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-6 text-sm text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Close
        </button>
      </div>
    </div>
  );
}
