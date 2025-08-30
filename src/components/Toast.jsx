import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const colors = {
    success: 'border-green-500 text-green-700 dark:text-green-200',
    error: 'border-red-500 text-red-700 dark:text-red-200',
    info: 'border-blue-500 text-blue-700 dark:text-blue-200'
  };
  const color = colors[toast.type] || colors.info;
  return (
    <div className="fixed bottom-4 right-4">
      <div className={`flex items-center gap-2 rounded-xl border-l-4 bg-background-light/90 p-3 shadow-card backdrop-blur dark:bg-background-dark/90 ${color}`}>
        <span>{toast.message}</span>
        {toast.tx && (
          <button
            onClick={() => window.open(`https://etherscan.io/tx/${toast.tx}`, '_blank')}
            className="text-sm underline"
          >
            View tx
          </button>
        )}
      </div>
    </div>
  );
}
