import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import ClaimableToken from "./ClaimableToken.json";
import NetworkBadge from "./components/NetworkBadge.jsx";
import TokenSummary from "./components/TokenSummary.jsx";
import EligibilityInfo from "./components/EligibilityInfo.jsx";
import CtaButton from "./components/CtaButton.jsx";
import FeeHint from "./components/FeeHint.jsx";
import SuccessModal from "./components/SuccessModal.jsx";
import Skeleton from "./components/Skeleton.jsx";
import Spinner from "./components/Spinner.jsx";
import { toast } from "./components/ToastProvider.jsx";
import RecentActivity from "./components/RecentActivity.jsx";
import ClaimsTable from "./components/ClaimsTable.jsx";
import Input from "./components/Input.jsx";
import Stat from "./components/Stat.jsx";

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
        selected
          ? "border-emerald-400 ring-4 ring-emerald-400/20"
          : "border-white/15 hover:border-white/30"
      } focus:outline-none focus:ring-2 focus:ring-white/30 ${className}`}
      aria-pressed={selected}
      aria-label={`Select logo ${label}`}
      role="button"
      tabIndex={0}
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
            aria-label="Refresh"
            role="button"
            tabIndex={0}
          >
            Refresh
          </button>
      </div>
      {!stats || stats.loading ? (
        <div className="mt-4 flex flex-col items-center gap-4">
          <Spinner className="h-5 w-5" />
          <div className="grid w-full gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
          <div>
            Claimed: {stats.claimedTotal.toLocaleString()} / {stats.totalSupply.toLocaleString()}
          </div>
          <div>Remaining: {stats.remaining.toLocaleString()}</div>
          <div>Claim count: {stats.claimCount}</div>
          <div>Unique claimers: {stats.uniqueClaimers}</div>
        </div>
      )}
    </div>
  );
}

export default function MvpTokenApp() {
  // --- UI state (mock only) ---
  const [logoId, setLogoId] = useState(0);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [tokenAddress, setTokenAddress] = useState(null);
  const [contractInput, setContractInput] = useState("");
  const [loadState, setLoadState] = useState("idle");
  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState({});

  // mock token detail preview
  const TOTAL = 1_000_000;
  const [remaining, setRemaining] = useState(1_000_000);
  const [claimedCount, setClaimedCount] = useState(0);
  const [claimHistory, setClaimHistory] = useState([]); // cumulative claimed values
  const [claims, setClaims] = useState([]);
  const [activity, setActivity] = useState([]);
  const [claimTab, setClaimTab] = useState("summary");
  const [claimState, setClaimState] = useState("idle");
  const [createState, setCreateState] = useState("idle");
  const [txHash, setTxHash] = useState(null);

  const nameRef = useRef(null);

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
    nameRef.current.focus();
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tc.history") || "[]");
    setHistory(stored);
  }, []);

  const loadContract = async () => {
    if (!ethers.isAddress(contractInput)) {
      toast.error("Invalid address");
      return;
    }
    try {
      setLoadState("loading");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractInput,
        ClaimableToken.abi,
        provider
      );
      const [rem, count, tokenName, tokenSymbol, blockNumber, network] =
        await Promise.all([
          contract.remaining(),
          contract.claimCount(),
          contract.name?.(),
          contract.symbol?.(),
          provider.getBlockNumber(),
          provider.getNetwork(),
        ]);
      const remainingTokens = Number(ethers.formatUnits(rem, 18));
      setTokenAddress(contractInput);
      setRemaining(remainingTokens);
      setClaimedCount(Number(count));
      if (tokenName) setName(tokenName);
      if (tokenSymbol) setSymbol(tokenSymbol);

      const entry = {
        chainId: Number(network.chainId),
        createdAt: Date.now(),
        token: contractInput,
        pool: contractInput,
        name: tokenName || "Token",
        symbol: tokenSymbol || "TKN",
        author: "",
        description: "",
        logoId: 0,
        poolCreationBlock: blockNumber,
      };
      let stored = JSON.parse(localStorage.getItem("tc.history") || "[]");
      stored = stored.filter(
        (h) => h.token.toLowerCase() !== contractInput.toLowerCase()
      );
      stored.unshift(entry);
      localStorage.setItem("tc.history", JSON.stringify(stored));
      setHistory(stored);

      const activityKey = `tc.activity.${contractInput.toLowerCase()}`;
      let cachedActivity = JSON.parse(localStorage.getItem(activityKey) || "[]");
      if (cachedActivity.length === 0) {
        const logs = await provider.getLogs({
          address: contractInput,
          topics: [ethers.id("Claimed(address,uint256)")],
          fromBlock: 0,
          toBlock: "latest",
        });
        const iface = new ethers.Interface(ClaimableToken.abi);
        cachedActivity = await Promise.all(
          logs.map(async (log) => {
            try {
              const parsed = iface.parseLog(log);
              const block = await provider.getBlock(log.blockNumber);
              return {
                type: "claim",
                address: parsed.args.by,
                amount: Number(ethers.formatUnits(parsed.args.amount, 18)),
                time: Number(block.timestamp) * 1000,
              };
            } catch {
              return null;
            }
          })
        );
        cachedActivity = cachedActivity.filter(Boolean);
        localStorage.setItem(activityKey, JSON.stringify(cachedActivity));
      }
      setClaims((c) => [
        ...c,
        ...cachedActivity.map(({ address, amount, time }) => ({
          address,
          amount,
          time,
        })),
      ]);
      setActivity((a) => [
        ...a,
        ...cachedActivity,
        { type: "contract-loaded", token: contractInput, time: Date.now() },
      ]);

      setLoadState("idle");
    } catch (err) {
      console.error("Failed to load contract", err);
      toast.error("Failed to load contract");
      setLoadState("idle");
    }
  };

  const doCreate = async () => {
    if (!connected) return;
    try {
      setCreateState("loading");
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
      setCreateState("success");
      toast.success("Deploy successful");
    } catch (err) {
      console.error("Deploy failed", err);
      setCreateState("error");
      toast.error("Deploy failed");
    } finally {
      setTimeout(() => setCreateState("idle"), 3000);
    }
  };

  const doClaim = async () => {
    if (!connected || !tokenAddress) return;
    try {
      setClaimState("loading");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        tokenAddress,
        ClaimableToken.abi,
        signer
      );
      const tx = await contract.claim();
      setTxHash(tx.hash);
      await tx.wait();
      const addr = await signer.getAddress();
      const claimTime = Date.now();
      const claimEntry = {
        type: "claim",
        address: addr,
        amount: eligibleAmount,
        time: claimTime,
      };
      setClaims((c) => [
        ...c,
        { address: addr, amount: eligibleAmount, time: claimTime },
      ]);
      setActivity((a) => [...a, claimEntry]);
      const actKey = `tc.activity.${tokenAddress.toLowerCase()}`;
      const storedActs = JSON.parse(localStorage.getItem(actKey) || "[]");
      storedActs.push(claimEntry);
      localStorage.setItem(actKey, JSON.stringify(storedActs));
      const rem = await contract.remaining();
      const count = await contract.claimCount();
      const remainingTokens = Number(ethers.formatUnits(rem, 18));
      setRemaining(remainingTokens);
      setClaimedCount(Number(count));
      setClaimHistory((h) => [...h, TOTAL - remainingTokens]);
      setClaimState("success");
      toast.success("Claim successful");
    } catch (err) {
      console.error("Claim failed", err);
      toast.error("Claim failed");
      setClaimState("error");
      setTimeout(() => setClaimState("idle"), 3000);
    }
  };

  const closeModal = () => {
    setTxHash(null);
    setClaimState("idle");
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

  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setAccount(null);
    setChainId(null);
  }, []);

  useEffect(() => {
    history.forEach((h) => refreshEntry(h));
  }, [history]);

  useEffect(() => {
    if (!window.ethereum || !connected) return;
    const handleChainChanged = (id) => setChainId(Number(id));
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
      }
    };
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [connected, disconnectWallet]);

  const claimedSoFar = Math.max(0, TOTAL - remaining);
  const eligibleAmount = remaining >= 100 ? 100 : remaining;

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Wallet not found");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      setConnected(true);
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundFX />

      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white shadow-inner">
              <span className="text-sm font-bold">MVP</span>
            </div>
            <div className="text-lg font-semibold tracking-tight">Token Claim</div>
          </div>
          <div className="flex items-center gap-2">
            <NetworkBadge chainId={chainId} />
            {connected ? (
              <>
                <span className="text-sm font-medium text-zinc-200">
                  {shorten(account)}
                </span>
                <button
                  className={`rounded-xl bg-white px-3 py-2 text-sm font-medium text-black shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30`}
                  onClick={disconnectWallet}
                  aria-label="Disconnect wallet"
                  role="button"
                  tabIndex={0}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                className={`rounded-xl bg-white px-3 py-2 text-sm font-medium text-black shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30`}
                onClick={connectWallet}
                aria-label="Connect wallet"
                role="button"
                tabIndex={0}
              >
                Connect wallet
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section
            id="create"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Create token</h2>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Name *</label>
                <Input
                  ref={nameRef}
                  placeholder="e.g. WalkCoin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">Symbol *</label>
                <Input
                  className="uppercase"
                  placeholder="e.g. WLK"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.slice(0, 11))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
                <div>
                <label className="mb-1 block text-sm text-zinc-300">Author *</label>
                <Input
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
                <Input
                  as="textarea"
                  className="min-h-[96px]"
                  placeholder="Short description of the token and its purpose…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Claimed summary + simple chart (creator view) */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {createState === "loading" ? (
                <>
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </>
              ) : (
                <>
                  <Stat
                    label="Claimed by others"
                    value={claimedSoFar.toLocaleString()}
                    hint="Tokens already claimed by other users"
                  />
                  <Stat
                    label="Claim count"
                    value={claimedCount.toLocaleString()}
                    hint="Total number of claim transactions"
                  />
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
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-zinc-400">Supply: 1,000,000 • Claim reward: 100</div>
              <CtaButton
                label={
                  createState === "success"
                    ? "Created!"
                    : createState === "error"
                    ? "Failed"
                    : "Create token"
                }
                onClick={doCreate}
                disabled={!connected || !formValid}
                state={createState}
              />
            </div>

            {!connected && (
              <div className="mt-3 text-xs text-amber-300">Connect your wallet first to create a token.</div>
            )}
          </section>

          <section
            id="claim"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Claim tokens</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadContract();
              }}
              className="mb-4 flex gap-2"
            >
              <Input
                value={contractInput}
                onChange={(e) => setContractInput(e.target.value)}
                placeholder="Contract address"
              />
              <button
                type="submit"
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                disabled={loadState === "loading"}
              >
                {loadState === "loading" ? <Spinner className="h-5 w-5" /> : "Load contract"}
              </button>
            </form>
            <div className="mb-4 flex gap-4 border-b border-white/10">
              <button
                onClick={() => setClaimTab("summary")}
                className={`pb-2 text-sm ${
                  claimTab === "summary"
                    ? "border-b-2 border-emerald-400 text-white"
                    : "text-zinc-400"
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setClaimTab("table")}
                className={`pb-2 text-sm ${
                  claimTab === "table"
                    ? "border-b-2 border-emerald-400 text-white"
                    : "text-zinc-400"
                }`}
              >
                Claims
              </button>
            </div>

            {claimTab === "summary" && (
              <>
                {tokenAddress ? (
                  <>
                    <TokenSummary
                      tokenAddress={tokenAddress}
                      name={sampleToken.name}
                      symbol={sampleToken.symbol}
                      progress={Math.round(((TOTAL - remaining) / TOTAL) * 100)}
                      chainId={chainId}
                    />

                    <EligibilityInfo
                      status={remaining > 0 ? "eligible" : "not eligible"}
                      eligibleAmount={eligibleAmount}
                    />
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                    Enter a contract address to load token details.
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {tokenAddress ? (
                    <>
                      <Stat
                        label="Remaining pool"
                        value={remaining.toLocaleString()}
                        hint="Tokens left to be claimed"
                      />
                      <Stat
                        label="Claim per tx"
                        value="100"
                        hint="Tokens claimable per transaction"
                      />
                      <Stat
                        label="Claim count"
                        value={claimedCount.toLocaleString()}
                        hint="Total number of claim transactions"
                      />
                    </>
                  ) : (
                    <div className="col-span-3 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-400">
                      Load a token contract to see stats.
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {tokenAddress ? (
                    <Progress total={TOTAL} remaining={remaining} />
                  ) : (
                    <div className="rounded-full border border-dashed border-white/10 p-3 text-center text-sm text-zinc-400">
                      Load a token contract to see progress.
                    </div>
                  )}
                </div>

                <RecentActivity activity={activity} />

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    {tokenAddress ? `Token contract: ${tokenAddress}` : "No contract loaded"}
                  </div>
                  <div className="text-right">
                    <CtaButton
                      label={
                        claimState === "success"
                          ? "Claimed!"
                          : claimState === "error"
                          ? "Failed"
                          : remaining > 0
                          ? `Claim ${eligibleAmount}`
                          : "Pool empty"
                      }
                      onClick={doClaim}
                      disabled={!connected || !tokenAddress || remaining === 0}
                      state={claimState}
                    />
                    <FeeHint text="~0.001 ETH" />
                  </div>
                </div>

                {!connected && (
                  <div className="mt-3 text-xs text-amber-300">Connect your wallet to claim tokens.</div>
                )}
            </>
          )}

            {claimTab === "table" && <ClaimsTable claims={claims} />}
          </section>
        </div>

        <section
          id="history"
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
        >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">History</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearHistory}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                  aria-label="Clear history"
                  role="button"
                  tabIndex={0}
                >
                  Clear history
                </button>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="text-sm text-zinc-400">No history.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
      </main>
      {claimState === "success" && txHash && (
        <SuccessModal txHash={txHash} chainId={chainId} onClose={closeModal} />
      )}
    </div>
  );
}
