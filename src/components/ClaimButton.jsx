import React from 'react';

export default function ClaimButton({ status = 'idle', label, onClick, disabled }) {
  const isDisabled = disabled || status === 'loading';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`relative isolate w-full rounded-2xl px-6 py-5 text-center font-medium text-white transition ${
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40`}
    >
      <span className="absolute inset-0 -z-10 rounded-2xl bg-[#0d1110] shadow-[0_12px_24px_rgba(16,185,129,0.12)]" />
      <span className={`pointer-events-none absolute inset-0 rounded-2xl ring-2 ${
        isDisabled ? 'ring-emerald-400/20' : 'ring-emerald-400/40'
      }`} />
      {status === 'loading' && (
        <span className="relative flex justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </span>
      )}
      {status === 'success' && <span className="relative">✔️</span>}
      {status === 'idle' && <span className="relative">{label}</span>}
    </button>
  );
}
