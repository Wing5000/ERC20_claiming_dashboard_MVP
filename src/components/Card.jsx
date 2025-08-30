import React from 'react';

export default function Card({ className = '', children }) {
  return (
    <div className={`rounded-2xl bg-background-light/70 dark:bg-background-dark/70 shadow-card backdrop-blur p-4 ${className}`}>
      {children}
    </div>
  );
}
