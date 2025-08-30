import React from "react";
import { toast } from "./ToastProvider.jsx";

export default function SuccessModal({ txHash, chainId, onClose }) {
  const explorers = {
    1: "https://etherscan.io",
    5: "https://goerli.etherscan.io",
    11155111: "https://sepolia.etherscan.io",
  };
  const base = explorers[chainId] || "https://etherscan.io";
  const url = `${base}/tx/${txHash}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(txHash);
      toast.success("Copied");
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-white">Claim successful</h2>
        <p className="break-all text-sm text-zinc-300">{txHash}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={copy}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Copy
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-500"
          >
            Open in explorer
          </a>
        </div>
        <button
          onClick={onClose}
          className="mt-6 text-sm text-zinc-400 transition hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
