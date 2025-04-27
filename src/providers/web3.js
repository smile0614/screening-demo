import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers"; // Use BrowserProvider implicitly

// Create Web3 context
export const Web3Context = createContext();

const Web3ProviderComponent = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [error, setError] = useState(null);

  // Network mapping for common chain IDs
  const networkMap = {
    "1": "Mainnet",
    "5": "Goerli",
    "11155111": "Sepolia",
    "137": "Polygon",
    "80001": "Polygon Mumbai",
  };

  // Initialize provider on mount
  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
        } catch (err) {
          setError("Failed to initialize Web3 provider.");
          console.error(err);
        }
      } else {
        setError("Please install MetaMask, Phantom, or another Web3 wallet.");
      }
    };

    // Listen for wallet injection
    const handleEthereum = () => {
      if (window.ethereum) {
        initializeProvider();
      }
    };

    window.addEventListener("ethereum#initialized", handleEthereum, { once: true });
    const timeout = setTimeout(handleEthereum, 1000);

    return () => {
      window.removeEventListener("ethereum#initialized", handleEthereum);
      clearTimeout(timeout);
    };
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (!provider) {
      setError("Web3 provider not available.");
      return;
    }

    try {
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        setError("No accounts found. Please unlock your wallet or add an account.");
        return;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);

      setSigner(signer);
      setWalletAddress(address);
      setNetworkName(networkMap[Number(network.chainId)] || "Unknown Network");
      setEthBalance(ethers.formatEther(balance));
      setError(null);
    } catch (err) {
      let errorMessage = "Failed to connect wallet. Please try again.";
      setError(errorMessage);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setSigner(null);
    setWalletAddress(null);
    setNetworkName(null);
    setEthBalance(null);
    setError(null);
  };

  // Handle account and network changes
  useEffect(() => {
    if (provider && window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(address);
          setSigner(signer);
          setWalletAddress(address);
          setNetworkName(networkMap[Number(network.chainId)] || "Unknown Network");
          setEthBalance(ethers.formatEther(balance));
        }
      };

      const handleChainChanged = async () => {
        const network = await provider.getNetwork();
        setNetworkName(networkMap[Number(network.chainId)] || "Unknown Network");
        if (walletAddress) {
          const balance = await provider.getBalance(walletAddress);
          setEthBalance(ethers.formatEther(balance));
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [provider, walletAddress]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        walletAddress,
        networkName,
        ethBalance,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3ProviderComponent;