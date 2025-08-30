import React, { useMemo, useState, useEffect } from "react";
import { ethers } from "ethers";
import blockies from "ethereum-blockies";

const LABELS = {
  1: "Ethereum",
  5: "Goerli",
  10: "Optimism",
  56: "BSC",
  97: "BSC Testnet",
  137: "Polygon",
  420: "Optimism Goerli",
  42161: "Arbitrum",
  421613: "Arbitrum Goerli",
  11155111: "Sepolia",
};

export default function AddressBadge({ address, chainId }) {
  const [gasPrice, setGasPrice] = useState(null);

  useEffect(() => {
    if (!chainId || !window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.getFeeData().then((fee) => {
      if (fee.gasPrice) {
        const gwei = Number(fee.gasPrice) / 1e9;
        setGasPrice(gwei);
      }
    });
  }, [chainId]);

  const identicon = useMemo(() => {
    if (!address) return null;
    return blockies.create({ seed: address.toLowerCase(), size: 8, scale: 4 }).toDataURL();
  }, [address]);

  if (!address) return null;

  const network = LABELS[Number(chainId)] || (chainId ? `Chain ${chainId}` : "");
  const title = `Address: ${address}\n${network ? `Network: ${network}\n` : ""}${
    gasPrice != null ? `Gas: ${gasPrice.toFixed(2)} gwei` : ""
  }`.trim();

  return (
    <span
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-zinc-200"
      title={title}
    >
      {identicon && <img src={identicon} alt="identicon" className="h-6 w-6 rounded" />}
      <span>
        {address.slice(0, 6)}…{address.slice(-4)}
      </span>
    </span>
  );
}
