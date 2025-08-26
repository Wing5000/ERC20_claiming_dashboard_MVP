import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { trackEvent } from '../trackEvent';
import useToasts from './useToasts';

const EXPECTED_CHAIN_ID = 1; // Ethereum mainnet by default

export default function useWallet() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const { showError } = useToasts();

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      setConnecting(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      const network = await prov.getNetwork();
      setAccount(addr);
      setChainId(Number(network.chainId));
      trackEvent('connect_wallet', { account: addr, chainId: Number(network.chainId) });
    } catch (err) {
      showError(err.code || 'unknown');
      trackEvent('connect_fail', { code: err.code });
    } finally {
      setConnecting(false);
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toBeHex(EXPECTED_CHAIN_ID) }],
      });
      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));
    } catch (err) {
      showError(err.code || 'unknown');
    }
  }, [provider]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccounts = (accs) => setAccount(accs[0]);
    const handleChain = (id) => setChainId(Number(id));
    window.ethereum.on('accountsChanged', handleAccounts);
    window.ethereum.on('chainChanged', handleChain);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccounts);
      window.ethereum.removeListener('chainChanged', handleChain);
    };
  }, []);

  return {
    provider,
    account,
    chainId,
    connecting,
    connectWallet,
    expectedChainId: EXPECTED_CHAIN_ID,
    wrongNetwork: chainId != null && chainId !== EXPECTED_CHAIN_ID,
    switchNetwork,
  };
}
