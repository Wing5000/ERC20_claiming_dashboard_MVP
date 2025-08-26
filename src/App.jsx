import React, { useMemo, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import ClaimableToken from "./ClaimableToken.json";
import useWallet from "./hooks/useWallet";
import useToasts from "./hooks/useToasts";
import ClaimButton from "./components/ClaimButton";
import InstallWallet from "./components/InstallWallet";
import { useTranslation } from "react-i18next";

// MVP single-file UI mock (no blockchain wired yet)
// Tailwind only. Dark theme, simple modern buttons.

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* soft gradient glows */}
      <div className="absolute left-1/2 top-[-20%] h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_60%)] blur-3xl" />
      <div className="absolute right-[-10%] bottom-[-20%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_60%)] blur-3xl" />
      {/* subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
      {/* top vignette */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/70 to-transparent" />
    </div>
  );
}

function LogoSwatch({ id, selected, onSelect, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`group relative flex h-16 w-16 items-center justify-center rounded-2xl border transition-all ${
        selected ? "border-emerald-400 ring-4 ring-emerald-400/20" : "border-white/15 hover:border-white/30"
      } ${className}`}
      aria-pressed={selected}
      aria-label={`Select logo ${label}`}
    >
      {/* Simple geometric logo mock */}
      <div className="pointer-events-none select-none">
        {id === 0 && (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500" />
        )}
        {id === 1 && (
          <div className="h-8 w-8 rotate-45 rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-700" />
        )}
        {id === 2 && (
          <div className="h-8 w-8 bg-[conic-gradient(at_50%_50%,#a1a1aa,#52525b,#a1a1aa)] rounded-full" />
        )}
      </div>
      <span className="absolute -bottom-6 text-xs text-zinc-300">{label}</span>
    </button>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
      <div className="text-sm text-zinc-300">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-400">{hint}</div>}
    </div>
  );
}

function Progress({ total, remaining }) {
  const claimed = Math.max(0, total - remaining);
  const pct = Math.min(100, Math.round((claimed / total) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
        <span>Claim progress</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-zinc-400">
        {claimed.toLocaleString()} / {total.toLocaleString()} tokens claimed
      </div>
    </div>
  );
}

// Simple inline SVG sparkline (no deps)
function SimpleSparkline({ data, max = 1_000_000, height = 56 }) {
  if (!data || data.length === 0) data = [0];
  const w = 120; // viewBox width
  const h = height;
  const m = 6; // vertical margin inside chart
  const maxVal = Math.max(max, ...data);
  const points = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * (w - 2);
    const y = h - m - (v / maxVal) * (h - m * 2);
    return `${x + 1},${y}`;
  });
  const path = `M${points.join(" L ")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full">
      <path d={path} fill="none" stroke="rgb(52,211,153)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Simple primary CTA (same style/color for both)
function CtaButton({ label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative isolate w-full rounded-2xl px-6 py-5 text-center font-medium text-white transition ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40`}
    >
      {/* background + elevation */}
      <span className="absolute inset-0 -z-10 rounded-2xl bg-[#0d1110] shadow-[0_12px_24px_rgba(16,185,129,0.12)]" />
      {/* single neon outline */}
      <span className={`pointer-events-none absolute inset-0 rounded-2xl ring-2 ${
        disabled ? "ring-emerald-400/20" : "ring-emerald-400/40"
      }`} />
      <span className="relative tracking-tight">{label}</span>
    </button>
  );
}

function shorten(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function relativeTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function HistoryItem({ item, stats, onRefresh }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">
            {item.name} / {item.symbol}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            Token {shorten(item.token)} • Pool {shorten(item.pool)} • Chain {item.chainId}
          </div>
          <div className="mt-1 text-xs text-zinc-400">{relativeTime(item.createdAt)}</div>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Refresh
        </button>
      </div>
      {stats?.loading ? (
        <div className="mt-4 flex justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
          <div>
            Claimed: {stats?.claimedTotal?.toLocaleString() || 0} / {stats?.totalSupply?.toLocaleString() || 0}
          </div>
          <div>Remaining: {stats?.remaining?.toLocaleString() || 0}</div>
          <div>Claim count: {stats?.claimCount ?? 0}</div>
          <div>Unique claimers: {stats?.uniqueClaimers ?? 0}</div>
        </div>
      )}
    </div>
  );
}

export default function MvpTokenApp() {
  // --- UI state (mock only) ---
  const [mode, setMode] = useState("home"); // home | create | claim | history
  const [logoId, setLogoId] = useState(0);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const { t, i18n } = useTranslation();
  const {
    account,
    connectWallet,
    chainId,
    wrongNetwork,
    switchNetwork,
  } = useWallet();
  const { showError, showSuccess } = useToasts();
  const connected = !!account;
  const [tokenAddress, setTokenAddress] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState({});
  const mainRef = useRef(null);

  // mock token detail preview
  const TOTAL = 1_000_000;
  const [remaining, setRemaining] = useState(1_000_000);
  const [claimedCount, setClaimedCount] = useState(0);
  const [claimHistory, setClaimHistory] = useState([]); // cumulative claimed values
  const [claimStatus, setClaimStatus] = useState('idle');

  const formValid = name.trim() && symbol.trim() && author.trim() && description.trim();

  const sampleToken = useMemo(
    () => ({
      name: name || "Token name",
      symbol: symbol || "SYM",
      author: author || "Author / Address",
      description: description || "Short description of the token and its purpose.",
      logoId,
    }),
    [name, symbol, author, description, logoId]
  );

  useEffect(() => {
    if (mode !== "home" && mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mode]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tc.history") || "[]");
    setHistory(stored);
  }, []);

  const doCreate = async () => {
    if (!connected) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(
        ClaimableToken.abi,
        ClaimableToken.bytecode,
        signer
      );
      const contract = await factory.deploy(
        name || "Token",
        symbol || "TKN",
        author || "",
        description || "",
        logoId.toString()
      );
      await contract.waitForDeployment();
      setTokenAddress(contract.target);

      const rem = await contract.remaining();
      const count = await contract.claimCount();
      setRemaining(Number(ethers.formatUnits(rem, 18)));
      setClaimedCount(Number(count));
      setClaimHistory([]);

      const blockNumber = await provider.getBlockNumber();
      const network = await provider.getNetwork();
      const entry = {
        chainId: Number(network.chainId),
        createdAt: Date.now(),
        token: contract.target,
        pool: contract.target,
        name: name || "Token",
        symbol: symbol || "TKN",
        author: author || "",
        description: description || "",
        logoId,
        poolCreationBlock: blockNumber,
      };
      const stored = JSON.parse(localStorage.getItem("tc.history") || "[]");
      stored.unshift(entry);
      localStorage.setItem("tc.history", JSON.stringify(stored));
      setHistory(stored);
      setMode("claim");
    } catch (err) {
      console.error("Deploy failed", err);
    }
  };

  const doClaim = async () => {
    if (!connected || !tokenAddress || wrongNetwork) return;
    setClaimStatus('loading');
    trackEvent('claim_start', { account, tokenAddress });
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        tokenAddress,
        ClaimableToken.abi,
        signer
      );
      const tx = await contract.claim();
      await tx.wait();
      const rem = await contract.remaining();
      const count = await contract.claimCount();
      const remainingTokens = Number(ethers.formatUnits(rem, 18));
      setRemaining(remainingTokens);
      setClaimedCount(Number(count));
      setClaimHistory((h) => [...h, TOTAL - remainingTokens]);
      setClaimStatus('success');
      showSuccess('claimed');
      trackEvent('claim_success', { account, tokenAddress });
    } catch (err) {
      setClaimStatus('idle');
      trackEvent('claim_fail', { code: err.code });
      showError(err.code || 'unknown');
    }
  };

  const poolAbi = [
    "event Claimed(address indexed by,uint256 amount)",
    "function remaining() view returns(uint256)",
    "function claimCount() view returns(uint256)",
    "function claimedTotal() view returns(uint256)",
  ];

  const tokenAbi = [
    "function totalSupply() view returns(uint256)",
    "function name() view returns(string)",
    "function symbol() view returns(string)",
  ];

  const refreshEntry = async (item) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const pool = new ethers.Contract(item.pool, poolAbi, provider);
      const token = new ethers.Contract(item.token, tokenAbi, provider);
      setHistoryStats((s) => ({ ...s, [item.token]: { ...s[item.token], loading: true } }));
      const [rem, count, claimed, total] = await Promise.all([
        pool.remaining(),
        pool.claimCount(),
        pool.claimedTotal(),
        token.totalSupply(),
      ]);
      const logs = await provider.getLogs({
        address: item.pool,
        topics: [ethers.id("Claimed(address,uint256)")],
        fromBlock: item.poolCreationBlock,
        toBlock: "latest",
      });
      const iface = new ethers.Interface(poolAbi);
      const claimers = new Set();
      logs.forEach((log) => {
        try {
          const parsed = iface.parseLog(log);
          claimers.add(parsed.args.by.toLowerCase());
        } catch (_) {}
      });
      setHistoryStats((s) => ({
        ...s,
        [item.token]: {
          loading: false,
          remaining: Number(ethers.formatUnits(rem, 18)),
          claimCount: Number(count),
          claimedTotal: Number(ethers.formatUnits(claimed, 18)),
          totalSupply: Number(ethers.formatUnits(total, 18)),
          uniqueClaimers: claimers.size,
        },
      }));
    } catch (err) {
      console.error("Refresh failed", err);
      setHistoryStats((s) => ({ ...s, [item.token]: { ...s[item.token], loading: false } }));
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("tc.history");
    setHistory([]);
    setHistoryStats({});
  };

  useEffect(() => {
    if (mode === "history") {
      history.forEach((h) => refreshEntry(h));
    }
  }, [mode, history]);

  const claimedSoFar = Math.max(0, TOTAL - remaining);

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundFX />

      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner">
              <span className="text-sm font-bold">MVP</span>
            </div>
            <div className="text-lg font-semibold tracking-tight">Token Claim</div>
          </div>
          <div className="flex items-center gap-2">
            {mode !== "home" && (
              <button
                className={`rounded-xl bg-white px-3 py-2 text-sm font-medium text-black shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30`}
                onClick={!connected ? connectWallet : undefined}
              >
                {connected && account ? `${account.slice(0, 6)}…${account.slice(-4)}` : t('connect_wallet')}
              </button>
            )}
          </div>
        </div>
      </header>

      {wrongNetwork && (
        <div className="bg-red-600 text-white text-sm p-2 text-center">
          {t('wrong_network')} {" "}
          <button onClick={switchNetwork} className="underline">
            {t('switch_network')}
          </button>
        </div>
      )}

      {!window.ethereum && !connected && (
        <div className="mx-auto max-w-md p-4">
          <InstallWallet />
        </div>
      )}

      {/* Landing: headline + two simple buttons (same style) */}
      {mode === "home" && (
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight">What do you want to do?</h1>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
            <CtaButton label="Create token" onClick={() => setMode("create")} />
            <CtaButton label="Claim tokens" onClick={() => setMode("claim")} />
            <CtaButton label="History" onClick={() => setMode("history")} />
          </div>
        </section>
      )}

      {/* Focused sections */}
      <main ref={mainRef} className="mx-auto max-w-6xl px-4 pb-16">
        {/* CREATE VIEW ONLY */}
        {mode === "create" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create token</h2>
              <button
                onClick={() => setMode("home")}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                ← Back
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Name *</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="e.g. WalkCoin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Symbol *</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 uppercase text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="e.g. WLK"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.slice(0, 11))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">Author *</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30"
                    placeholder="Your name or address"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">Logo *</label>
                  <div className="flex items-end gap-6 pt-1">
                    <LogoSwatch id={0} label="A" selected={logoId === 0} onSelect={setLogoId} />
                    <LogoSwatch id={1} label="B" selected={logoId === 1} onSelect={setLogoId} />
                    <LogoSwatch id={2} label="C" selected={logoId === 2} onSelect={setLogoId} />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Description *</label>
                <textarea
                  className="min-h-[96px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="Short description of the token and its purpose…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Claimed summary + simple chart (creator view) */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Stat label="Claimed by others" value={claimedSoFar.toLocaleString()} hint={`out of ${TOTAL.toLocaleString()}`} />
              <Stat label="Claim count" value={claimedCount.toLocaleString()} />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-zinc-300">Claim activity</div>
                <div className="mt-2">
                  {claimHistory.length > 0 ? (
                    <SimpleSparkline data={claimHistory} max={TOTAL} />
                  ) : (
                    <div className="text-xs text-zinc-400">No claims yet</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-zinc-400">Supply: 1,000,000 • Claim reward: 100</div>
              <CtaButton label="Create token" onClick={doCreate} disabled={!connected || !formValid} />
            </div>

            {!connected && (
              <div className="mt-3 text-xs text-amber-300">Connect your wallet first to create a token.</div>
            )}
          </section>
        )}

        {/* CLAIM VIEW ONLY */}
        {mode === "claim" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Claim tokens</h2>
              <button
                onClick={() => setMode("home")}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                ← Back
              </button>
            </div>

            <div className="flex items-start gap-4">
              {/* Logo render */}
              <div className="mt-1 flex h-14 w-14 items:center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-sm">
                {sampleToken.logoId === 0 && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500" />
                )}
                {sampleToken.logoId === 1 && (
                  <div className="h-8 w-8 rotate-45 rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-700" />
                )}
                {sampleToken.logoId === 2 && (
                  <div className="h-8 w-8 bg-[conic-gradient(at_50%_50%,#a1a1aa,#52525b,#a1a1aa)] rounded-full" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{sampleToken.name}</h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200">
                    {sampleToken.symbol}
                  </span>
                </div>
                <div className="mt-1 text-sm text-zinc-300">{sampleToken.description}</div>
                <div className="mt-2 text-xs text-zinc-400">Author: {sampleToken.author}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Stat label="Remaining pool" value={remaining.toLocaleString()} hint="out of 1,000,000" />
              <Stat label="Claim per tx" value="100" />
              <Stat label="Claim count" value={claimedCount.toLocaleString()} />
            </div>

            <div className="mt-6">
              <Progress total={TOTAL} remaining={remaining} />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-zinc-400 flex items-center gap-2">
                {tokenAddress ? (
                  <>
                    <span>{shorten(tokenAddress)}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(tokenAddress)}
                      className="underline"
                    >
                      Copy
                    </button>
                    <a
                      href={`https://etherscan.io/address/${tokenAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Explorer
                    </a>
                  </>
                ) : (
                  <span>Contract address will appear after deployment</span>
                )}
              </div>
              <ClaimButton
                status={claimStatus}
                label={remaining > 0 ? t('claim') : t('claimed')}
                onClick={doClaim}
                disabled={!connected || remaining === 0 || wrongNetwork}
              />
            </div>

            {!connected && (
              <div className="mt-3 text-xs text-amber-300">Connect your wallet to claim tokens.</div>
            )}
          </section>
        )}
        {mode === "history" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">History</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearHistory}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Clear history
                </button>
                <button
                  onClick={() => setMode("home")}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  ← Back
                </button>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="text-sm text-zinc-400">No history.</div>
            ) : (
              <div className="grid gap-4">
                {history.map((item) => (
                  <HistoryItem
                    key={`${item.token}-${item.pool}-${item.createdAt}`}
                    item={item}
                    stats={historyStats[item.token]}
                    onRefresh={() => refreshEntry(item)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-400">
        MVP UI — ERC‑20 + ClaimPool focused views
      </footer>
    </div>
  );
}
