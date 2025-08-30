import React from 'react';
import Spinner from './Spinner.jsx';

export default function Button({ state = 'idle', children, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';
  const variants = {
    idle: 'bg-primary text-white hover:bg-primary/90',
    disabled: 'bg-primary text-white opacity-50 cursor-not-allowed',
    loading: 'bg-primary text-white opacity-70 cursor-wait',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white'
  };
  const variant = variants[state] || variants.idle;
  return (
    <button
      {...props}
      disabled={state === 'disabled' || state === 'loading'}
      className={`${base} ${variant} ${className}`}
    >
      {state === 'loading' && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
}
