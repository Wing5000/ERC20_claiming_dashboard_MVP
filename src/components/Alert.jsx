import React from 'react';

export default function Alert({ type = 'info', children, className = '' }) {
  const styles = {
    info: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-200',
    success: 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-200',
    error: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-200',
  };
  return (
    <div className={`rounded-xl border-l-4 p-4 ${styles[type]} ${className}`}>{children}</div>
  );
}
