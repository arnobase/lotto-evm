import { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWeb3 } from '../contexts/Web3Context';

export const useCurrentDraw = () => {
  const { queryNumber } = useContract();
  const { evmAccount, evmNetwork } = useWeb3();
  const [drawNumber, setDrawNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchDrawNumber = async () => {
      // Ne pas essayer de récupérer si pas de compte connecté
      if (!evmAccount || !evmNetwork) {
        if (mounted) {
          setIsLoading(false);
          setDrawNumber(null);
          setError(null);
        }
        return;
      }

      if (mounted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const number = await queryNumber('getDrawNumber');
        
        if (mounted) {
          if (number !== null) {
            setDrawNumber(number.toString());
            setError(null);
          } else {
            setDrawNumber(null);
            setError('No draw number available');
          }
        }
      } catch (err) {
        console.error('Error fetching draw number:', err);
        if (mounted) {
          setError('Failed to fetch draw number');
          setDrawNumber(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDrawNumber();

    return () => {
      mounted = false;
    };
  }, [queryNumber, evmAccount, evmNetwork]);

  return { drawNumber, isLoading, error };
}; 