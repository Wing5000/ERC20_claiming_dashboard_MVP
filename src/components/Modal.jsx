import React from 'react';
import Button from './Button.jsx';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-background-light p-6 shadow-card dark:bg-background-dark">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <div>{children}</div>
        <div className="mt-4 text-right">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
