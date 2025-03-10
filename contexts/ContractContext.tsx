import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import { LotteryContract } from '../libs/contract';
import { LotteryResult, TransactionParams } from '../components/lottery/results/types';

interface ContractContextType {
  doQuery: (method: string, args: number[][]) => Promise<LotteryResult[]>;
  doTx: (params: TransactionParams) => Promise<{ hash: string }>;
  dryRun: (method: string, args: number[][]) => Promise<{ success: boolean }>;
  queryNumber: (method: string) => Promise<number | null>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
}

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const { evmBrowserProvider, evmCustomProvider, evmNetwork } = useWeb3();
  const [contract, setContract] = useState<LotteryContract | null>(null);

  useEffect(() => {
    if (evmBrowserProvider && evmCustomProvider && evmNetwork) {
      const newContract = new LotteryContract(
        evmBrowserProvider,
        evmCustomProvider,
        evmNetwork
      );
      setContract(newContract);
    }
  }, [evmBrowserProvider, evmCustomProvider, evmNetwork]);

  const doQuery = async (method: string, args: number[][]): Promise<LotteryResult[]> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    return contract.doQuery(method, args);
  };

  const doTx = async (params: TransactionParams): Promise<{ hash: string }> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    return contract.doTx(params);
  };

  const dryRun = async (method: string, args: number[][]): Promise<{ success: boolean }> => {
    if (!contract) {
      return { success: false };
    }
    return contract.dryRun(method, args);
  };

  const queryNumber = async (method: string): Promise<number | null> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    return contract.queryNumber(method);
  };

  return (
    <ContractContext.Provider value={{ doQuery, doTx, dryRun, queryNumber }}>
      {children}
    </ContractContext.Provider>
  );
}
