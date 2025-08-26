import React from 'react';
import { useTranslation } from 'react-i18next';

export default function InstallWallet() {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <p className="mb-4">{t('no_wallet')}</p>
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        className="text-emerald-400 underline"
      >
        MetaMask
      </a>
    </div>
  );
}
