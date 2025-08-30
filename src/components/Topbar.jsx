import React, { useState } from 'react';
import Button from './Button.jsx';

export default function Topbar() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', next);
  };
  return (
    <header className="sticky top-0 z-10 w-full border-b border-black/10 bg-background-light/80 backdrop-blur dark:border-white/10 dark:bg-background-dark/80">
      <div className="mx-auto flex max-w-2xl items-center justify-between p-4">
        <div className="font-semibold">ERC20 Claim</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Testnet</span>
          <Button onClick={toggle} className="px-3 py-1 text-sm">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </div>
    </header>
  );
}
