import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ethers } from "ethers";
import { NETWORKS } from "../libs/constants";
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from "../libs/storage";

type MetaMaskEventHandler = (args: unknown[]) => void;

declare global {
  interface Window {
    ethereum: ethers.Eip1193Provider & {
      on(eventName: string, handler: MetaMaskEventHandler): void;
      removeListener(eventName: string, handler: MetaMaskEventHandler): void;
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

  const clearWalletState = useCallback(() => {
    console.log("🧹 Clearing wallet state");
    setEvmAccount(null);
    setEvmSigner(null);
    setToStorage("lotto-evm-account", undefined);
  }, []);

  // Gestionnaires d'événements pour les changements de wallet
  const handleAccountsChanged = useCallback((accounts: unknown[]) => {
    console.log("👥 Accounts changed event:", accounts);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      console.log("📴 Wallet disconnected");
      clearWalletState();
    } else {
      console.log("🔌 Account updated:", accounts[0]);
      checkAndUpdateConnection();
    }
  }, [clearWalletState]);

  const handleChainChanged = useCallback((_chainId: unknown) => {
    console.log("⛓️ Chain changed:", _chainId);
    window.location.reload();
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
      // Vérifie silencieusement si le site est déjà autorisé
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
      
      if (accounts.length > 0) {
        console.log("✅ Site already authorized, account:", accounts[0]);
        
        const provider = await initializeProvider();
        if (!provider) return;

        // Vérifie le réseau actuel
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const targetNetwork = NETWORKS.find(net => net.name === evmNetwork && net.type === 'EVM');

        if (targetNetwork && currentChainId !== targetNetwork.info.chainId) {
          console.log("⚠️ Wrong network, switching to:", targetNetwork.name);
          await switchEvmNetwork(targetNetwork.name);
        }

        const signer = await provider.getSigner();
        setEvmSigner(signer);
        setEvmAccount(signer);
        setToStorage("lotto-evm-account", accounts[0]);

        // Configure le custom provider
        if (targetNetwork?.type === 'EVM') {
          const customProvider = new ethers.JsonRpcProvider(targetNetwork.info.rpcUrls[0]);
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

  // Connexion explicite au wallet (quand l'utilisateur clique sur le bouton)
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
      const typedError = error as { code: number; message: string };
      
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

  // Changement de réseau
  const switchEvmNetwork = useCallback(async (networkName: string) => {
    console.log("🔄 Switching network to:", networkName);
    if (!window.ethereum) return;

    const network = NETWORKS.find(n => n.name === networkName);
    if (!network) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.info.chainId }],
      });
      
      setEvmNetwork(networkName);
    } catch (error) {
      const switchError = error as { code: number };
      if (switchError.code === 4902) {
        try {
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
          setEvmNetwork(networkName);
        } catch (addError) {
          console.error('❌ Error adding network:', addError);
          toast.error("Failed to add network to wallet");
        }
      } else {
        console.error('❌ Error switching network:', switchError);
        toast.error("Failed to switch network");
      }
    }
  }, []);

  // Vérification initiale de la connexion
  useEffect(() => {
    checkAndUpdateConnection();
  }, [checkAndUpdateConnection]);

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
