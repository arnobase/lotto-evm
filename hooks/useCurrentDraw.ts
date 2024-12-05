import { useState, useEffect } from 'react';
import { useContract } from '../contexts/ContractContext';

export const useCurrentDraw = () => {
  const { queryNumber } = useContract();
  const [drawNumber, setDrawNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrawNumber = async () => {
      try {
        console.log('Fetching draw number...');
        setIsLoading(true);
        
        const number = await queryNumber('getDrawNumber');
        console.log('Raw draw number result:', number);
        
        if (number !== null) {
          const numberStr = number.toString();
          console.log('Setting draw number:', numberStr);
          setDrawNumber(numberStr);
        } else {
          console.log('No draw number returned');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching draw number:', err);
        setError('Failed to fetch draw number');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrawNumber();
  }, [queryNumber]);

  console.log('Current draw state:', { drawNumber, isLoading, error });
  return { drawNumber, isLoading, error };
}; 