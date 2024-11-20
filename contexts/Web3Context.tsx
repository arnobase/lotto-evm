import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
//import { Web3Provider, ExternalProvider, JsonRpcProvider,  } from "@ethersproject/providers";
import { ethers } from "ethers";
//import { Eip1193Provider } from "ethers";
import { NETWORKS } from "../libs/constants";
import toast from 'react-hot-toast';
import { getFromStorage, setToStorage } from "../libs/storage";

declare global {
  interface Window {
    ethereum: ethers.Eip1193Provider; 
  }
}

interface Web3ContextProps {
  evmBrowserProvider: ethers.BrowserProvider | null;
  evmSigner: ethers.JsonRpcSigner | null | undefined;
  evmCustomProvider: ethers.JsonRpcProvider | null;
  evmAccount: ethers.JsonRpcSigner | null | undefined;
  evmNetwork: string;
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

  let isInit = false;

  const evmConnectWallet = useCallback(async () => {
    console.log("evmConnectWallet");

    if (evmBrowserProvider) {
      console.log("evmBrowserProvider")
      try {
        const network = NETWORKS.find(net => net.name === 'Minato' && net.type === 'EVM');
        if (network && network.type === 'EVM') {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: network.info.chainId }],
          });
        }
      } catch (error) {
        const typedError = error as { code: number };
        if (typedError.code === 4902) {
          console.log("Network not found. Attempting to add...");
          await checkAndAddNetwork();
        } else {
          console.error("Failed to switch network:", error);
          return;
        }
      }

      try {
        const accounts = await evmBrowserProvider.listAccounts();
        console.log("accounts", accounts);
        if (accounts.length > 0) {
          setEvmAccount(accounts[0]);
          setToStorage("lotto-evm-account",accounts[0].address);
          console.log(accounts[0]);
        }
      } catch (accountError) {
        console.error("Failed to list accounts:", accountError);
      }
    }
    else {console.log("wallet not connected")}
  }, [evmBrowserProvider]);

  useEffect(() => {
    if (!evmAccount) {
      if (getFromStorage("lotto-evm-account")) {
        evmConnectWallet();
      }
    } 
  }, [evmAccount, evmConnectWallet]);

  useEffect(() => {
    /*
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setEvmAccount(accounts[0]);
      } else {
        setEvmAccount(null);
      }
    };*/
    // EVM Part
    const init = async () => {
      isInit=true;
      try {
      if (window.ethereum) {
        
        /*window.ethereum.request({ method: 'eth_accounts' })
          .then(handleAccountsChanged)
          .catch(console.error);
       }*/

        const network = NETWORKS.find(net => net.name === evmNetwork && net.type === 'EVM');
        if (network && network.type === 'EVM') {
          console.log(network.name)
            const rpcUrl = network.info.rpcUrls[0];
            const customProvider = new ethers.JsonRpcProvider(rpcUrl);
          console.log(1)
            setEvmCustomProvider(customProvider);
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
          console.log(2)  
          try{
            const signer = await browserProvider.getSigner().catch((e)=>{
              console.log("Erreur GetSigner",e)
              toast.error(
                "Metamask est déja en cours de chargement, dévérouiller ou relancer votre navigateur",
                {position: 'bottom-right'}
              )
              return null;
            });
            console.log(3)
            setEvmBrowserProvider(browserProvider);
            setEvmSigner(signer);
          }
          catch (e) {
              console.log(e);
          }  
          isInit=false;
        }
      } else {
        console.error("No Ethereum browser extension detected");
      }
    }
    catch (error) {
      console.log("Erreur MM",error);
      
    }
  } 
    if (!isInit) init();
    
  }, [evmNetwork]);

  const checkAndAddNetwork = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      console.error("No Ethereum browser extension detected");
      return;
    }

    const network = NETWORKS.find(net => net.name === 'Minato' && net.type === 'EVM');
    if (network && network.type === 'EVM') {
      try {
        const networkData = network.info;
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkData]
        });

        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkData.chainId }],
        });
      } catch (addError) {
        console.error("Failed to add or switch network:", addError);
      }
    }
  };

  const evmDisconnectWallet = () => {
    setEvmAccount(null);
    setToStorage("lotto-evm-account",undefined);
  };

  const switchEvmNetwork = async (networkName: string) => {
    const network = NETWORKS.find(n => n.name === networkName);
    if (!network || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.info.chainId }],
      });
      
      setEvmNetwork(networkName);
    } catch (switchError: any) {
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
          console.error('Error adding network:', addError);
        }
      }
      console.error('Error switching network:', switchError);
    }
  };

  return (
    <Web3Context.Provider value={{ 
      evmBrowserProvider, 
      evmSigner, 
      evmCustomProvider, 
      evmAccount, 
      evmNetwork, 
      switchEvmNetwork, 
      evmConnectWallet, 
      evmDisconnectWallet 
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3ProviderComponent");
  }
  return context;
};
