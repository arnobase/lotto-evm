import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./Web3Context";
import contractABI from "../libs/abi/LottoClient.json";
import toast from 'react-hot-toast';
import { NETWORKS } from "../libs/constants";
import { CONTRACT_ADDRESSES } from "../libs/constants";

function getContractAddress(networkName: string): string {
  const address = CONTRACT_ADDRESSES[networkName];
  if (!address) {
    throw new Error(`No contract address found for network: ${networkName}`);
  }
  return address;
}

interface ContractError {
  code?: string | number;
  errorName?: string;
  errorArgs?: unknown[];
  message?: string;
  reason?: string;
  data?: string;
}

interface DryRunResult {
  success: boolean;
  errorName?: string;
  errorArgs?: unknown[];
  reason?: string;
  message?: string;
}

interface ContractContextProps {
  doQuery: (queryFunction: string, setResult?: (result: object | string | null) => void) => Promise<void>;
  doTx: <T extends unknown[]>(tx: string, p: T, setResult?: (result: object | null) => void) => Promise<void>;
  dryRun: <T extends unknown[]>(tx: string, p: T) => Promise<DryRunResult>;
  contract: ethers.Contract | null;
  queryContract: ethers.Contract | null;
}

const ContractContext = createContext<ContractContextProps | undefined>(undefined);

export function ContractProvider({ children }: { children: ReactNode }) {
  const { evmBrowserProvider, evmCustomProvider, evmAccount, evmNetwork } = useWeb3();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [queryContract, setQueryContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (evmBrowserProvider && evmNetwork) {
      const contractInstance = new ethers.Contract(
        getContractAddress(evmNetwork),
        contractABI.abi,
        evmBrowserProvider
      );
      setContract(contractInstance);
    }
    if (evmCustomProvider && evmNetwork) {
      const queryContractInstance = new ethers.Contract(
        getContractAddress(evmNetwork),
        contractABI.abi,
        evmCustomProvider
      );
      setQueryContract(queryContractInstance);
    }
  }, [evmBrowserProvider, evmCustomProvider, evmAccount, evmNetwork]);

  const doQuery = async (queryFunction: string, setResult?: (result: object | string | null) => void) => {
    if (queryContract) {
      try {
        const result = await queryContract[queryFunction]();
        if (setResult) setResult(result);
      } catch (error) {
        console.error("Failed to interact with contract:", error);
      }
    }
  };

  async function doTx<T extends unknown[]>(
    tx: string,
    p: T,
    setResult?: (result: object | null) => void
  ): Promise<void> {
    if (contract && evmBrowserProvider) {
      const toastId = toast.loading("Preparing Tx...");
      try {
        const signer = await evmBrowserProvider.getSigner();
        const contractInstance = contract.connect(signer);
        
        toast.loading("Sending Tx...", { id: toastId });
        const txResponse = await (contractInstance as ethers.Contract)[tx](...p);
        
        toast.loading("Processing Tx...", { id: toastId });
        const receipt = await txResponse.wait();

        const network = NETWORKS.find(net => net.name === evmNetwork && net.type === 'EVM');
        if (network && network.type === 'EVM' && network.info.blockExplorerUrls) {
          const explorerUrl = `${network.info.blockExplorerUrls[0]}/tx/${receipt.hash}`;
          toast.success(
            <div>
              Transaction success!
              <br />
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                show in block explorer
              </a>
            </div>,
            { id: toastId, duration: 120000 }
          );
        } else {
          toast.success("Tx confirmed !", { id: toastId });
        }
        
        if (setResult) setResult(receipt);
      } catch (error) {
        console.error("Failed to interact with contract:", error);
        toast.error("Erreur while processing Tx", { id: toastId });
      }
    } else {
      toast.error("Wallet not connected");
    }
  };

  

  const dryRun = async <T extends unknown[]>(tx: string, p: T): Promise<DryRunResult> => {
    if (contract && evmBrowserProvider) {
      try {
        const signer = await evmBrowserProvider.getSigner();
        const contractInstance = contract.connect(signer);
        await (contractInstance as ethers.Contract)[tx].staticCall(...p);
        return { success: true };
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null) {
          const contractError = error as ContractError;
          return {
            success: false,
            errorName: contractError.errorName,
            errorArgs: contractError.errorArgs,
            reason: contractError.reason,
            message: contractError.message
          };
        }
        
        return {
          success: false,
          message: "Unknown error in dry run"
        };
      }
    }
    return {
      success: false,
      message: "wallet not connected"
    };
  };

  return (
    <ContractContext.Provider value={{ 
      doQuery, 
      doTx, 
      dryRun, 
      contract, 
      queryContract 
    }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
}
