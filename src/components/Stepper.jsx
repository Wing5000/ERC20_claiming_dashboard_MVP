import React from "react";

export default function Stepper({ currentStep = 1 }) {
  const steps = ["Connect", "Verify", "Claim"];
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isCurrent = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          return (
            <li key={label} className="flex-1">
              <div
                className={`flex items-center ${idx > 0 ? "ml-2" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-emerald-400 bg-emerald-400 text-black"
                      : isCurrent
                      ? "border-emerald-400 text-emerald-400"
                      : "border-white/30 text-zinc-300"
                  }`}
                >
                  {isCompleted ? "✓" : stepNumber}
                </span>
                <span className="ml-2 text-sm text-zinc-300">{label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
