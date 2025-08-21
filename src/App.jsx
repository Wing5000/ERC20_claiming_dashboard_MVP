import React, { useMemo, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";

const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS;

const FACTORY_ABI = [
  "event Created(address indexed creator, address token, address pool)",
  "function createAll(string name_, string symbol_, string author_, string description_, string logoURI_) returns (address tokenAddr, address poolAddr)",
];

const CLAIMPOOL_ABI = [
  "function claim()",
  "function remaining() view returns (uint256)",
  "function claimAmount() view returns (uint256)",
  "function claimCount() view returns (uint256)",
  "function claimedTotal() view returns (uint256)",
  "function token() view returns (address)",
];

const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function author() view returns (string)",
  "function description() view returns (string)",
  "function logoURI() view returns (string)",
];

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

export default function MvpTokenApp() {
  // --- UI state ---
  const [mode, setMode] = useState("home"); // home | create | claim
  const [logoId, setLogoId] = useState(0);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [tokenAddress, setTokenAddress] = useState(null);
  const [poolAddress, setPoolAddress] = useState(null);
  const mainRef = useRef(null);

  const [totalSupply, setTotalSupply] = useState(1_000_000);
  const [remaining, setRemaining] = useState(1_000_000);
  const [claimAmount, setClaimAmount] = useState(100);
  const [claimedCount, setClaimedCount] = useState(0);
  const [claimedTotal, setClaimedTotal] = useState(0);
  const [claimHistory, setClaimHistory] = useState([]); // cumulative claimed values
  const [tokenMeta, setTokenMeta] = useState({
    name: "",
    symbol: "",
    author: "",
    description: "",
    logoURI: "",
  });

  const [factoryAddress, setFactoryAddress] = useState(FACTORY_ADDRESS || "");

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

  const displayToken = mode === "claim" ? { ...tokenMeta, logoId } : sampleToken;

  useEffect(() => {
    if (mode !== "home" && mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mode]);

  const loadInfo = async (poolAddr) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const pool = new ethers.Contract(poolAddr, CLAIMPOOL_ABI, provider);

    const [remRaw, claimAmtRaw, claimCntRaw, claimedTotRaw, tokenAddr] = await Promise.all([
      pool.remaining(),
      pool.claimAmount(),
      pool.claimCount(),
      pool.claimedTotal(),
      pool.token(),
    ]);

    const rem = Number(ethers.formatUnits(remRaw, 18));
    const claimAmt = Number(ethers.formatUnits(claimAmtRaw, 18));
    const claimCnt = Number(claimCntRaw);
    const claimedTot = Number(ethers.formatUnits(claimedTotRaw, 18));

    const token = new ethers.Contract(tokenAddr, TOKEN_ABI, provider);
    const [name_, symbol_, decimals_, totalSupplyRaw, author_, description_, logoURI_] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply(),
      token.author(),
      token.description(),
      token.logoURI(),
    ]);
    const total = Number(ethers.formatUnits(totalSupplyRaw, decimals_));

    setTokenAddress(tokenAddr);
    setPoolAddress(poolAddr);
    setRemaining(rem);
    setClaimAmount(claimAmt);
    setClaimedCount(claimCnt);
    setClaimedTotal(claimedTot);
    setTokenMeta({ name: name_, symbol: symbol_, author: author_, description: description_, logoURI: logoURI_ });
    setTotalSupply(total);

    return { claimedTotal: claimedTot };
  };

  const doCreate = async () => {
    if (!connected) return;
    if (!factoryAddress) {
      alert("Factory address not set");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);
      const logos = ["logoA", "logoB", "logoC"];
      const tx = await factory.createAll(
        name || "Token",
        symbol || "TKN",
        author || "",
        description || "",
        logos[logoId] || ""
      );
      const receipt = await tx.wait();

      let tokenAddr = null;
      let poolAddr = null;
      for (const log of receipt.logs) {
        try {
          const parsed = factory.interface.parseLog(log);
          if (parsed.name === "Created") {
            tokenAddr = parsed.args.token;
            poolAddr = parsed.args.pool;
            break;
          }
        } catch (err) {}
      }
      if (!tokenAddr || !poolAddr) throw new Error("Created event not found");

      setMode("claim");
      await loadInfo(poolAddr);
      setClaimHistory([]);
    } catch (err) {
      console.error("Deploy failed", err);
    }
  };

  const doClaim = async () => {
    if (!connected || !poolAddress) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pool = new ethers.Contract(poolAddress, CLAIMPOOL_ABI, signer);
      const tx = await pool.claim();
      await tx.wait();
      const info = await loadInfo(poolAddress);
      setClaimHistory((h) => [...h, info.claimedTotal]);
    } catch (err) {
      console.error("Claim failed", err);
    }
  };

  const claimedSoFar = claimedTotal;

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Wallet not found");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setConnected(true);
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundFX />

      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">Token Claim MVP</h1>
          <div className="flex items-center gap-4">
            {connected ? (
              <span className="text-sm text-zinc-400">{account}</span>
            ) : (
              <button
                onClick={connectWallet}
                className="rounded-xl border border-emerald-400/40 bg-emerald-400/20 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              >
                Connect wallet
              </button>
            )}
            {connected && (
              <button
                onClick={() => setMode("create")}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                + Create
              </button>
            )}
          </div>
        </div>
      </header>

      <main ref={mainRef} className="mx-auto max-w-4xl px-4 py-12">
        {mode === "home" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-4 text-xl font-semibold">Welcome</h2>
            <p className="text-sm text-zinc-300">
              Create your own ERC‑20 token with a claim pool. Users can claim fixed rewards until the pool is empty.
            </p>
            {!connected && (
              <div className="mt-6">
                <CtaButton label="Connect wallet" onClick={connectWallet} />
              </div>
            )}
          </section>
        )}

        {mode === "create" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Create your token</h2>
              <button
                onClick={() => setMode("home")}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                ← Back
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">Factory address *</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30"
                    placeholder="0x..."
                    value={factoryAddress}
                    onChange={(e) => setFactoryAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">Token name *</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30"
                    placeholder="My Token"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-300">Symbol *</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-400/30"
                    placeholder="TKN"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  />
                </div>
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
              <Stat label="Claimed by others" value={claimedSoFar.toLocaleString()} hint={`out of ${totalSupply.toLocaleString()}`} />
              <Stat label="Claim count" value={claimedCount.toLocaleString()} />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-zinc-300">Claim activity</div>
                <div className="mt-2">
                  {claimHistory.length > 0 ? (
                    <SimpleSparkline data={claimHistory} max={totalSupply} />
                  ) : (
                    <div className="text-xs text-zinc-400">No claims yet</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-zinc-400">Supply: {totalSupply.toLocaleString()} • Claim reward: {claimAmount.toLocaleString()}</div>
              <CtaButton label="Create token" onClick={doCreate} disabled={!connected || !formValid || !factoryAddress} />
            </div>

            {!connected && (
              <div className="mt-3 text-xs text-amber-300">Connect your wallet first to create a token.</div>
            )}
          </section>
        )}

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
              <div className="mt-1 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-sm">
                {displayToken.logoId === 0 && (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500" />
                )}
                {displayToken.logoId === 1 && (
                  <div className="h-8 w-8 rotate-45 rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-700" />
                )}
                {displayToken.logoId === 2 && (
                  <div className="h-8 w-8 bg-[conic-gradient(at_50%_50%,#a1a1aa,#52525b,#a1a1aa)] rounded-full" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{displayToken.name}</h3>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-200">
                    {displayToken.symbol}
                  </span>
                </div>
                <div className="mt-1 text-sm text-zinc-300">{displayToken.description}</div>
                <div className="mt-2 text-xs text-zinc-400">Author: {displayToken.author}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Stat label="Remaining pool" value={remaining.toLocaleString()} hint={`out of ${totalSupply.toLocaleString()}`} />
              <Stat label="Claim per tx" value={claimAmount.toLocaleString()} />
              <Stat label="Claim count" value={claimedCount.toLocaleString()} />
            </div>

            <div className="mt-6">
              <Progress total={totalSupply} remaining={remaining} />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-zinc-400">
                {tokenAddress ? `Token: ${tokenAddress} • Pool: ${poolAddress}` : "Contract address will appear after deployment"}
              </div>
              <CtaButton
                label={
                  remaining > 0
                    ? remaining >= claimAmount
                      ? `Claim ${claimAmount}`
                      : `Claim ${remaining}`
                    : "Pool empty"
                }
                onClick={doClaim}
                disabled={!connected || remaining === 0}
              />
            </div>

            {!connected && (
              <div className="mt-3 text-xs text-amber-300">Connect your wallet to claim tokens.</div>
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

