import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 focus:border-secondary focus:outline-none dark:border-gray-600 ${className}`}
    />
  );
}
