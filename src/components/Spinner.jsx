import React from "react";

export default function Spinner({ className = "" }) {
  return (
    <span
      className={`block animate-spin rounded-full border-2 border-white/20 border-t-white ${className}`}
    />
  );
}
