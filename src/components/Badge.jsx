import React from 'react';

export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-block rounded-full bg-secondary/20 text-secondary px-2 py-0.5 text-xs ${className}`}>
      {children}
    </span>
  );
}
