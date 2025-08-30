import React, { useState, useEffect } from 'react';
import ClaimableToken from './ClaimableToken.json';
import Button from './components/Button.jsx';
import Card from './components/Card.jsx';
import Badge from './components/Badge.jsx';
import Alert from './components/Alert.jsx';
import Input from './components/Input.jsx';
import Skeleton from './components/Skeleton.jsx';
import Toast from './components/Toast.jsx';
import Modal from './components/Modal.jsx';
import Topbar from './components/Topbar.jsx';

function shorten(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
}

function Progress({ total, remaining }) {
  const claimed = Math.max(0, total - remaining);
  const pct = Math.min(100, Math.round((claimed / total) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>Claim progress</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {claimed.toLocaleString()} / {total.toLocaleString()} tokens claimed
      </div>
    </div>
  );
}

export default function App() {
const [userAddr, setUserAddr] = useState('');
  const [eligible, setEligible] = useState(null); // null = loading
  const [btnState, setBtnState] = useState('idle');
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [txHash, setTxHash] = useState('');

  const total = 1_000_000;
  const remaining = 700_000;

  const checkEligibility = () => {
    setEligible(null);
    setTimeout(() => setEligible(Math.random() > 0.5 ? 1000 : 0), 800);
  };

  const handleClaim = async () => {
    setBtnState('loading');
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const fakeHash = '0x' + Math.random().toString(16).slice(2);
      setTxHash(fakeHash);
      setModalOpen(true);
      setToast({ type: 'success', message: 'Claim successful', tx: fakeHash });
      setBtnState('success');
    } catch (e) {
      setToast({ type: 'error', message: 'Claim failed' });
      setBtnState('error');
    } finally {
      setTimeout(() => setBtnState('idle'), 2000);
    }
  };

  useEffect(() => {
    if (userAddr) checkEligibility();
  }, [userAddr]);
  useEffect(() => {
    checkEligibility();
  }, []);
  return (
    <div className="min-h-screen bg-background-light text-text-light dark:bg-background-dark dark:text-text-dark">
      <Topbar />
      <main id="main" className="mx-auto w-full max-w-2xl p-4 space-y-6">
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Token summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Name</span><span>{ClaimableToken.name}</span></div>
            <div className="flex justify-between"><span>Symbol</span><span>{ClaimableToken.symbol}</span></div>
            <div className="flex justify-between"><span>Total supply</span><span>{total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Remaining</span><span>{remaining.toLocaleString()}</span></div>
            <div className="flex items-center justify-between gap-2">
              <span>Contract</span>
              <button
                className="underline"
                onClick={() => navigator.clipboard.writeText(ClaimableToken.address)}
                title="Copy address"
              >
                {shorten(ClaimableToken.address)}
              </button>
              <a
                href={`https://etherscan.io/address/${ClaimableToken.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-xs"
              >
                Explorer
              </a>
            </div>
          </div>
          <div className="mt-6">
            <Progress total={total} remaining={remaining} />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Eligibility</h2>
          <Input value={userAddr} onChange={e=>setUserAddr(e.target.value)} placeholder="Address" className="mb-3" />
          {eligible === null ? (
            <Skeleton className="h-4 w-32" />
          ) : eligible > 0 ? (
            <Badge>You can claim {eligible}</Badge>
          ) : (
            <Alert type="info">Not eligible yet</Alert>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-semibold">Claim</h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Network fees apply.</p>
          <Button
            state={eligible > 0 ? btnState : 'disabled'}
            onClick={handleClaim}
            className="w-full"
          >
            Claim tokens
          </Button>
        </Card>
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Claim successful">
        <p className="break-all text-sm">{txHash}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => navigator.clipboard.writeText(txHash)} className="flex-1">
            Copy tx hash
          </Button>
          <Button onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')} className="flex-1">
            Open in explorer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
