import React from "react";
import CtaButton from "./CtaButton.jsx";

export default function StickyCTA({ onClick, disabled = false, state = "idle" }) {
  return (
    <>
      {/* Reserve space to avoid layout shift */}
      <div className="h-24 md:hidden" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 p-4 backdrop-blur md:hidden">
        <CtaButton label="Connect & Claim" onClick={onClick} disabled={disabled} state={state} />
      </div>
    </>
  );
}
