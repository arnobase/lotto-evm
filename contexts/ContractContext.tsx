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

interface TransactionResult {
  ticketId: number;
  drawId: number;
  address: string;
  numbers: number[];
}

interface ContractContextProps {
  doQuery: (method: string, args: number[][]) => void;
  doTx: <T extends unknown[]>(tx: string, p: T, setResult?: (result: object | null) => void) => Promise<TransactionResult | null>;
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

  const doQuery = async (method: string, args: number[][]) => {
    if (queryContract) {
      try {
        const result = await queryContract[method](...args);
        return result;
      } catch (error) {
        console.error("Failed to interact with contract:", error);
      }
    }
  };

  async function doTx<T extends unknown[]>(
    tx: string,
    p: T,
    setResult?: (result: object | null) => void
  ): Promise<TransactionResult | null> {
    if (contract && evmBrowserProvider) {
      const toastId = toast.loading("Preparing Tx...");
      try {
        const signer = await evmBrowserProvider.getSigner();
        const contractInstance = contract.connect(signer);
        
        toast.loading("Sending Tx...", { id: toastId });
        const txResponse = await (contractInstance as ethers.Contract)[tx](...p);
        
        toast.loading("Processing Tx...", { id: toastId });
        const receipt = await txResponse.wait();

        const rawResult = receipt.logs.length > 0 
          ? contract.interface.parseLog(receipt.logs[receipt.logs.length - 1])?.args 
          : null;

        const formattedResult = rawResult ? {
          ticketId: Number(Array.from(rawResult)[0]),
          drawId: Number(Array.from(rawResult)[1]),
          address: Array.from(rawResult)[2] as string,
          numbers: Array.from(Array.from(rawResult)[3]).map(n => Number(n))
        } : null;

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
        return formattedResult;
      } catch (error) {
        console.error("Failed to interact with contract:", error);
        toast.error("Erreur while processing Tx", { id: toastId });
        throw error;
      }
    } else {
      toast.error("Wallet not connected");
      throw new Error("Wallet not connected");
    }
    return null;
  }

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
