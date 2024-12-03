import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

// ABI du contrat LottoClient
import abi from "../libs/abi/LottoClient.json";

// Define an interface for the input data
interface InputData {
  type: string;
  name: string;
  value?: string | number | boolean;
}

// Define an interface for the decoded data
interface DecodedData {
  name: string;
  inputs: InputData[];
}

const useDecodeTransaction = (txHash: string) => {
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!txHash?.trim()) {
      setLoading(false);
      return;
    }

    const getTransactionDetails = async (hash: string) => {
      const url = `https://soneium-minato.blockscout.com/api/v2/transactions/${hash}/logs`;
      try {
        const response = await axios.get(url, {
          headers: {
            'accept': 'application/json',
          },
        });
        return response.data;
      } catch (error: unknown) {
        throw new Error(`API request error: ${(error as Error).message}`);
      }
    };

    const decodeTransaction = async () => {
      try {
        const txDetails = await getTransactionDetails(txHash);
        
        if (!txDetails || !txDetails.items || txDetails.items.length === 0) {
          throw new Error("Transaction non trouvée ou sans données d'entrée.");
        }

        const decoded = txDetails.items[0].decoded; // Accéder aux données décodées

        if (!decoded || !decoded.parameters) {
          throw new Error("Échec du décodage de la transaction.");
        }

        const decodedData: DecodedData = {
          name: decoded.method_call,
          inputs: decoded.parameters.map((param: { type: string; name: string; value?: string | number | boolean }) => ({
            type: param.type,
            name: param.name,
            value: param.value,
          })),
        };
        setDecodedData(decodedData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    decodeTransaction();
  }, [txHash]);

  return { decodedData, loading, error };
};

export default useDecodeTransaction;
