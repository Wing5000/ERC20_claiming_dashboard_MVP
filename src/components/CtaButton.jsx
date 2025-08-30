import React from "react";

export default function CtaButton({ label, onClick, disabled = false, state = "idle" }) {
  const isLoading = state === "loading";

  const ringColors = {
    idle: "ring-emerald-400/40",
    loading: "ring-emerald-400/40",
    success: "ring-emerald-400/60",
    error: "ring-rose-400/60",
  };

  const bgColors = {
    idle: "bg-[#0d1110]",
    loading: "bg-[#0d1110]",
    success: "bg-emerald-600",
    error: "bg-rose-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative isolate w-full rounded-2xl px-6 py-5 text-center font-medium text-white transition ${
        disabled || isLoading ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40`}
    >
      <span
        className={`absolute inset-0 -z-10 rounded-2xl ${bgColors[state]} shadow-[0_12px_24px_rgba(16,185,129,0.12)]`}
      />
      <span className={`pointer-events-none absolute inset-0 rounded-2xl ring-2 ${ringColors[state]}`} />
      {isLoading ? (
        <span className="relative flex items-center justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </span>
      ) : (
        <span className="relative tracking-tight">{label}</span>
      )}
    </button>
  );
}
