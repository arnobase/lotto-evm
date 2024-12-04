import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from '../libs/abi/LottoClient.json';
import { useWeb3 } from '../contexts/Web3Context';

interface DecodedData {
  name: string;
  inputs: {
    name: string;
    value: any;
  }[];
}

interface UseDecodeTransactionResult {
  decodedData: DecodedData | null;
  loading: boolean;
  error: Error | null;
}

const useDecodeTransaction = (transactionHash: string): UseDecodeTransactionResult => {
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { evmCustomProvider } = useWeb3();

  useEffect(() => {
    const decodeTransaction = async () => {
      if (!transactionHash || !evmCustomProvider) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Récupérer la transaction
        const tx = await evmCustomProvider.getTransaction(transactionHash);
        if (!tx || !tx.data) {
          throw new Error('Transaction not found or has no data');
        }

        // Créer une interface pour décoder les données
        const iface = new ethers.Interface(contractABI.abi);
        
        // Décoder les données de la transaction
        const decodedData = iface.parseTransaction({ data: tx.data });
        
        if (!decodedData) {
          throw new Error('Failed to decode transaction data');
        }

        // Formater les données décodées
        const formattedData: DecodedData = {
          name: decodedData.name,
          inputs: decodedData.args.map((arg, index) => ({
            name: decodedData.fragment.inputs[index].name,
            value: arg
          }))
        };

        setDecodedData(formattedData);
      } catch (err) {
        console.error('Error decoding transaction:', err);
        setError(err instanceof Error ? err : new Error('Failed to decode transaction'));
      } finally {
        setLoading(false);
      }
    };

    decodeTransaction();
  }, [transactionHash, evmCustomProvider]);

  return { decodedData, loading, error };
};

export default useDecodeTransaction;
