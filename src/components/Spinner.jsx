import React from 'react';

export default function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em] ${className}`}
      role="status"
    />
  );
}
