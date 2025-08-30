import React from "react";
import Spinner from "./Spinner.jsx";

export default function CtaButton({ label, onClick, disabled = false, state = "idle" }) {
  const isLoading = state === "loading";

  const ringColors = {
    idle: "ring-emerald-400/40",
    loading: "ring-emerald-400/40",
    success: "ring-emerald-400/60",
    error: "ring-rose-400/60",
  };

  const bgColors = {
    idle: "bg-[#f0f0f0] dark:bg-[#0d1110]",
    loading: "bg-[#f0f0f0] dark:bg-[#0d1110]",
    success: "bg-emerald-600",
    error: "bg-rose-600",
  };

  const textColors = {
    idle: "text-black dark:text-white",
    loading: "text-black dark:text-white",
    success: "text-white",
    error: "text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative isolate w-full rounded-2xl px-6 py-5 text-center font-medium transition ${textColors[state]} ${
        disabled || isLoading ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40`}
      aria-label={label}
    >
      <span
        className={`absolute inset-0 -z-10 rounded-2xl ${bgColors[state]} shadow-[0_12px_24px_rgba(16,185,129,0.12)]`}
      />
      <span className={`pointer-events-none absolute inset-0 rounded-2xl ring-2 ${ringColors[state]}`} />
      {isLoading ? (
        <span className="relative flex items-center justify-center">
          <Spinner className="h-5 w-5" />
        </span>
      ) : (
        <span className="relative tracking-tight">{label}</span>
      )}
    </button>
  );
}
