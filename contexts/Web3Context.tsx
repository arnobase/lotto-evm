import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../libs/constants";
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from "../libs/storage";

type MetaMaskEventHandler = (args: unknown[]) => void;

interface MetaMaskError extends Error {
  code: number;
  message: string;
}

declare global {
  interface Window {
    ethereum: ethers.Eip1193Provider & {
      on(eventName: string, handler: MetaMaskEventHandler): void;
      removeListener(eventName: string, handler: MetaMaskEventHandler): void;
      request(args: { method: string; params?: unknown[] }): Promise<unknown>;
    };
  }
}

interface Web3ContextProps {
  evmBrowserProvider: ethers.BrowserProvider | null;
  evmSigner: ethers.JsonRpcSigner | null | undefined;
  evmCustomProvider: ethers.JsonRpcProvider | null;
  evmAccount: ethers.JsonRpcSigner | null | undefined;
  evmNetwork: string;
  isConnecting: boolean;
  error: Error | null;
  switchEvmNetwork: (network: string) => Promise<void>;
  evmConnectWallet: () => Promise<void>;
  evmDisconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextProps | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [evmBrowserProvider, setEvmBrowserProvider] = useState<ethers.BrowserProvider | null>(null);
  const [evmSigner, setEvmSigner] = useState<ethers.JsonRpcSigner | null | undefined>(undefined);
  const [evmCustomProvider, setEvmCustomProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [evmAccount, setEvmAccount] = useState<ethers.JsonRpcSigner | null | undefined>(undefined);
  const [evmNetwork, setEvmNetwork] = useState<string>("Minato");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isNetworkSwitchingRef = useRef(false);

  const clearWalletState = useCallback(() => {
    console.log("🧹 Clearing wallet state");
    setEvmAccount(null);
    setEvmSigner(null);
    setToStorage("lotto-evm-account", undefined);
  }, []);

  // Vérification et initialisation du provider
  const initializeProvider = useCallback(async () => {
    console.log("🏗️ Initializing provider");
    if (!window.ethereum) {
      const error = new Error("No Ethereum wallet found. Please install MetaMask.");
      console.error("❌", error);
      setError(error);
      return null;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setEvmBrowserProvider(browserProvider);
      return browserProvider;
    } catch (error) {
      console.error("❌ Provider initialization error:", error);
      setError(error instanceof Error ? error : new Error("Failed to initialize provider"));
      return null;
    }
  }, []);

  const checkAndUpdateConnection = useCallback(async () => {
    console.log("🔍 Checking connection status");
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      
      if (accounts.length > 0) {
        console.log("✅ Site already authorized, account:", accounts[0]);
        
        const provider = await initializeProvider();
        if (!provider) return;

        const signer = await provider.getSigner();
        setEvmSigner(signer);
        setEvmAccount(signer);
        setToStorage("lotto-evm-account", accounts[0]);

        // Configure le custom provider
        const network = NETWORKS.find(net => net.name === evmNetwork && net.type === 'EVM');
        if (network?.type === 'EVM') {
          const customProvider = new ethers.JsonRpcProvider(network.info.rpcUrls[0]);
          setEvmCustomProvider(customProvider);
        }
      } else {
        console.log("❌ Site not authorized yet");
        clearWalletState();
      }
    } catch (error) {
      console.error("❌ Connection check error:", error);
      clearWalletState();
    }
  }, [evmNetwork, initializeProvider, clearWalletState]);

  // Connexion explicite au wallet
  const evmConnectWallet = useCallback(async () => {
    console.log("🔌 Explicitly connecting wallet");
    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (accounts.length > 0) {
        await checkAndUpdateConnection();
      }
    } catch (error) {
      console.error("❌ Connection error:", error);
      const typedError = error as MetaMaskError;
      
      switch (typedError.code) {
        case 4001:
          toast.error("Please connect your wallet to continue");
          break;
        case -32002:
          toast.error("Please unlock your wallet");
          break;
        case 4902:
          toast.error("Network not found. Please add it to your wallet");
          break;
        default:
          toast.error(typedError.message || "Failed to connect wallet");
      }
      
      setError(error instanceof Error ? error : new Error("Failed to connect wallet"));
    } finally {
      setIsConnecting(false);
    }
  }, [checkAndUpdateConnection]);

  // Déconnexion du wallet
  const evmDisconnectWallet = useCallback(() => {
    console.log("🔌 Disconnecting wallet");
    clearWalletState();
    toast.success("Wallet disconnected successfully");
  }, [clearWalletState]);

  // Gestionnaire d'événements pour les changements de wallet
  const handleAccountsChanged = useCallback((accounts: unknown[]) => {
    console.log("👥 Accounts changed event:", accounts);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      console.log("📴 Wallet disconnected");
      clearWalletState();
    } else {
      console.log("🔌 Account updated:", accounts[0]);
      checkAndUpdateConnection();
    }
  }, [clearWalletState, checkAndUpdateConnection]);

  // Gestionnaire d'événements pour les changements de chaîne
  const handleChainChanged = useCallback((_chainId: unknown) => {
    console.log("⛓️ Chain changed:", _chainId);
    const chainId = (_chainId as string).toLowerCase();
    const network = NETWORKS.find(n => n.info.chainId.toLowerCase() === chainId);
    if (network) {
      console.log("✅ Setting network to:", network.name);
      setEvmNetwork(network.name);
    } else {
      console.log("❌ Unknown network chainId:", chainId);
    }
  }, []);

  // Initialisation des écouteurs d'événements
  useEffect(() => {
    console.log("🎧 Setting up event listeners");
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        console.log("🧹 Cleaning up event listeners");
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Vérification initiale de la connexion
  useEffect(() => {
    checkAndUpdateConnection();
  }, [checkAndUpdateConnection]);

  // Changement de réseau
  const switchEvmNetwork = useCallback(async (networkName: string) => {
    // Empêcher les requêtes multiples avec une référence
    if (isNetworkSwitchingRef.current) {
      console.log("🚫 Network switch already in progress");
      return;
    }

    console.log("🔄 Switching network to:", networkName);
    if (!window.ethereum) {
      console.error("❌ No ethereum provider found");
      return;
    }

    const network = NETWORKS.find(n => n.name === networkName);
    if (!network) {
      console.error("❌ Network not found:", networkName);
      return;
    }

    let toastId: string | undefined;

    try {
      isNetworkSwitchingRef.current = true;

      // Vérifier d'abord le réseau actuel
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      console.log("Current chain ID:", currentChainId, "Target chain ID:", network.info.chainId);
      
      // Normaliser les chainId pour la comparaison
      const normalizedCurrentChainId = currentChainId.toLowerCase();
      const normalizedTargetChainId = network.info.chainId.toLowerCase();
      
      if (normalizedCurrentChainId === normalizedTargetChainId) {
        console.log("✅ Already on the correct network");
        setEvmNetwork(networkName);
        return;
      }

      console.log("🔄 Requesting chain switch to:", network.info.chainId);
      
      // Afficher un toast de chargement
      toastId = toast.loading("Switching network...", { duration: Infinity });

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.info.chainId }],
        });
      } catch (error) {
        const switchError = error as MetaMaskError;
        
        // Si le réseau n'existe pas, on essaie de l'ajouter
        if (switchError.code === 4902) {
          console.log("🔄 Network not found, attempting to add it");
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.info.chainId,
              chainName: network.info.chainName,
              nativeCurrency: network.info.nativeCurrency,
              rpcUrls: network.info.rpcUrls,
              blockExplorerUrls: network.info.blockExplorerUrls
            }],
          });
        } else if (switchError.code === -32002) {
          // Si une requête est déjà en cours, on arrête ici
          if (toastId) toast.dismiss(toastId);
          toast.error("Network switch already pending. Please check MetaMask.");
          return;
        } else if (switchError.code === 4001) {
          // Si l'utilisateur a refusé, on arrête ici
          if (toastId) toast.dismiss(toastId);
          toast.error("Network switch cancelled");
          return;
        } else {
          throw switchError;
        }
      }

      // Attendre un peu que le changement soit effectif
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier que le changement a bien eu lieu
      const newChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      console.log("✅ Current chain after switch:", newChainId);
      
      // Normaliser le nouveau chainId pour la comparaison
      const normalizedNewChainId = newChainId.toLowerCase();
      
      if (normalizedNewChainId === normalizedTargetChainId) {
        console.log("✅ Network switch successful");
        if (toastId) toast.dismiss(toastId);
        toast.success("Network switched successfully");
        setEvmNetwork(networkName);
      } else {
        console.error("❌ Chain ID mismatch after switch. Expected:", normalizedTargetChainId, "Got:", normalizedNewChainId);
        if (toastId) toast.dismiss(toastId);
        toast.error("Network switch failed - please try again");
      }
    } catch (error) {
      console.error('❌ Unexpected error switching network:', error);
      if (toastId) toast.dismiss(toastId);
      toast.error("Failed to switch network. Please try again.");
    } finally {
      isNetworkSwitchingRef.current = false;
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        evmBrowserProvider,
        evmSigner,
        evmCustomProvider,
        evmAccount,
        evmNetwork,
        isConnecting,
        error,
        switchEvmNetwork,
        evmConnectWallet,
        evmDisconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
