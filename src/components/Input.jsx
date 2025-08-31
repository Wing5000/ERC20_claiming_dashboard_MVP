import React, { forwardRef } from "react";

const Input = forwardRef(function Input(
  { as: Component = "input", className = "", ...props },
  ref
) {
  const baseClasses =
    "w-full rounded-xl border border-black/10 bg-white/5 px-3 py-2 text-black outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30 dark:border-white/10 dark:bg-black/40 dark:text-white";
  return <Component ref={ref} className={`${baseClasses} ${className}`} {...props} />;
});

export default Input;
