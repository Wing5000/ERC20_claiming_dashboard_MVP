import React, { useState } from "react";
import Input from "./Input.jsx";

export default function LeadModal({ onSubmit, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    if (!email || status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      if (onSubmit) onSubmit(email);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-white">Stay in the loop</h2>
        {status === "success" ? (
          <p className="text-sm text-zinc-300">Thanks! We'll be in touch.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {status === "loading" ? "Submitting..." : "Submit"}
            </button>
            {status === "error" && (
              <div className="text-sm text-amber-400">Submission failed. Please try again.</div>
            )}
          </form>
        )}
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
