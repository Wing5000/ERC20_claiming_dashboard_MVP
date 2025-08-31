import React, { useState } from "react";

export default function Stat({ label, value, hint }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
      <div className="flex items-center text-sm text-zinc-300">
        <span>{label}</span>
        {hint && (
          <div
            className="relative ml-2"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Hint"
            >
              ?
            </button>
            {open && (
              <div className="absolute left-1/2 z-10 mt-2 w-40 -translate-x-1/2 rounded-md bg-zinc-800 p-2 text-center text-xs text-white shadow-lg" role="tooltip">
                {hint}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}

