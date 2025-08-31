import React from "react";
import { toast } from "./ToastProvider.jsx";

function getStoredRef() {
  try {
    const raw = localStorage.getItem("referral");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.expiry && data.expiry > Date.now()) {
      return data.value;
    }
    localStorage.removeItem("referral");
  } catch (e) {
    // ignore
  }
  return null;
}

function incrementInviteCount() {
  const key = "ref.invites";
  const count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, count);
}

export default function InviteModal({ onClose }) {
  const ref = getStoredRef();
  const base = window.location.origin;
  const link = ref ? `${base}?ref=${encodeURIComponent(ref)}` : base;
  const encoded = encodeURIComponent(link);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Copied");
      incrementInviteCount();
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  const handleShare = () => {
    incrementInviteCount();
  };

  const handleDiscord = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    handleShare();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-white">Invite friends</h2>
        <div className="flex flex-col gap-3">
          <a
            href={`https://x.com/intent/tweet?url=${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShare}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Share on X
          </a>
          <a
            href={`https://t.me/share/url?url=${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleShare}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Share on Telegram
          </a>
          <a
            href="https://discord.com/channels/@me"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDiscord}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Share on Discord
          </a>
          <button
            onClick={handleCopy}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          >
            Copy link
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
