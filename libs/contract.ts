import { ethers } from 'ethers';
import { LotteryResult, TransactionParams } from '../components/lottery/results/types';
import contractABI from './abi/LottoClient.json';
import { NETWORKS, CONTRACT_ADDRESSES } from './constants';
import toast from 'react-hot-toast';
import { renderTransactionToast } from '../components/common/Toast/TransactionToast';

function getContractAddress(networkName: string): string {
  const address = CONTRACT_ADDRESSES[networkName];
  if (!address) {
    throw new Error(`No contract address found for network: ${networkName}`);
  }
  return address;
}

export class LotteryContract {
  private contract: ethers.Contract | null = null;
  private queryContract: ethers.Contract | null = null;

  constructor(
    private browserProvider: ethers.BrowserProvider,
    private customProvider: ethers.Provider,
    private network: string
  ) {
    this.initializeContracts();
  }

  private async initializeContracts() {
    const address = getContractAddress(this.network);
    console.log('Initializing contract at address:', address);
    this.contract = new ethers.Contract(address, contractABI.abi, this.browserProvider);
    this.queryContract = new ethers.Contract(address, contractABI.abi, this.customProvider);
  }

  async doQuery(method: string, args: number[][]): Promise<LotteryResult[]> {
    if (!this.queryContract) {
      throw new Error('Contract not initialized');
    }

    try {
      if (typeof this.queryContract[method] !== 'function') {
        console.error(`Method ${method} not found in contract`);
        return [];
      }

      const result = await this.queryContract[method].apply(this.queryContract, args);
      
      if (Array.isArray(result)) {
        return this.formatResults(result);
      }
      
      if (result && typeof result === 'object') {
        return this.formatResults([result]);
      }

      return [];
    } catch (error) {
      console.error("Failed to query contract:", error);
      throw error;
    }
  }

  async doTx(params: TransactionParams): Promise<{ hash: string }> {
    const { method, args, toastId } = params;
    console.log('Starting doTx with method:', method, 'args:', args, 'toastId:', toastId);
    
    if (!this.contract || !this.browserProvider) {
      console.error('Contract or provider not initialized');
      throw new Error('Contract or provider not initialized');
    }

    try {
      console.log('Getting signer...');
      const signer = await this.browserProvider.getSigner();
      console.log('Signer obtained:', signer.address);
      
      const contractWithSigner = this.contract.connect(signer);
      console.log('Contract connected with signer');

      if (typeof contractWithSigner[method] !== 'function') {
        console.error(`Method ${method} not found in contract`);
        throw new Error(`Method ${method} not found in contract`);
      }

      console.log('Preparing transaction call...');
      
      // Préparer la transaction sans l'envoyer
      const txRequest = await contractWithSigner[method].populateTransaction(...args);
      console.log('Transaction request prepared:', txRequest);

      // Envoyer la transaction
      console.log('Sending transaction to MetaMask...');
      const tx = await signer.sendTransaction(txRequest);
      console.log('Transaction sent:', tx);

      // Mettre à jour le toast existant
      toast.loading("Processing transaction...", { id: toastId });
      
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      const network = NETWORKS.find(net => net.name === this.network);
      if (network?.type === 'EVM' && network.info.blockExplorerUrls && receipt) {
        const explorerUrl = `${network.info.blockExplorerUrls[0]}/tx/${receipt.hash}`;
        // Mettre à jour le toast existant avec le succès
        toast.success(
          renderTransactionToast('success', 'Transaction successful!', explorerUrl),
          { id: toastId, duration: 60000 }
        );
      } else {
        // Mettre à jour le toast existant avec le succès
        toast.success("Transaction confirmed!", { id: toastId, duration: 60000 });
      }

      return { hash: tx.hash };
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }

  async dryRun(method: string, args: number[][]): Promise<{ success: boolean }> {
    if (!this.contract || !this.browserProvider) {
      return { success: false };
    }

    try {
      console.log('Starting dry run with method:', method, 'args:', args);
      const signer = await this.browserProvider.getSigner();
      const contractWithSigner = this.contract.connect(signer);

      if (typeof contractWithSigner[method] !== 'function') {
        throw new Error(`Method ${method} not found in contract`);
      }

      await contractWithSigner[method].staticCall.apply(contractWithSigner, args);
      console.log('Dry run successful');
      return { success: true };
    } catch (error) {
      console.error("Dry run failed:", error);
      return { success: false };
    }
  }

  private formatResults(rawResults: any[]): LotteryResult[] {
    return rawResults.map(result => {
      if (!result || typeof result !== 'object') {
        console.error('Invalid result format:', result);
        return null;
      }

      try {
        return {
          numbers: Array.isArray(result.numbers) ? result.numbers.map(Number) : [],
          timestamp: Number(result.timestamp || 0),
          transactionHash: result.transactionHash || '',
          hash: result.transactionHash || ''
        };
      } catch (error) {
        console.error('Error formatting result:', error);
        return null;
      }
    }).filter(Boolean) as LotteryResult[];
  }
} 