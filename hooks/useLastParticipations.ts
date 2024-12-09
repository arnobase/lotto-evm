import { useState, useEffect, useCallback } from 'react';
import { useLotteryParticipations } from './useLotteryParticipations';
import { useWeb3 } from '../contexts/Web3Context';

const STORAGE_KEY = 'lotto-participation-history';
const MAX_HISTORY = 5;

// Mapping des noms de réseaux entre l'indexeur et notre configuration
const NETWORK_NAME_MAPPING: { [key: string]: string } = {
  'Soneium (testnet)': 'Minato',
  'Moonbase Alpha': 'Moonbase',
  'Moonbeam (testnet)': 'Moonbase',
  'lotto_Shibuya': 'Shibuya',
  'Minato': 'Minato',
  'Moonbase': 'Moonbase',
  'Shibuya': 'Shibuya'
};

// Fonction utilitaire pour normaliser les noms de réseaux
const normalizeNetworkName = (chain: string): string => {
  return NETWORK_NAME_MAPPING[chain] || chain;
};

interface StoredParticipation {
  numbers: number[];
  chain: string;
  hash: string;
  timestamp: string;
  drawNumber?: string;
}

export interface CombinedParticipation {
  numbers: number[];
  chain: string;
  hash: string;
  timestamp: string;
  drawNumber?: string;
  isLocal?: boolean;
}

export const useLastParticipations = () => {
  const { evmAccount } = useWeb3();
  const [localParticipations, setLocalParticipations] = useState<StoredParticipation[]>([]);
  const [processedParticipations, setProcessedParticipations] = useState<CombinedParticipation[]>([]);
  const { participations: indexerParticipations, isLoading, refreshParticipations: refreshIndexerParticipations } = useLotteryParticipations({
    accountId: evmAccount?.address,
    first: MAX_HISTORY
  });

  // Charger l'historique local au montage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        const history = JSON.parse(storedHistory);
        setLocalParticipations(history.slice(0, MAX_HISTORY));
      }
    } catch (error) {
      console.error('Error loading participation history:', error);
    }
  }, []);

  // Ajouter une nouvelle participation
  const addParticipation = useCallback((participation: Omit<StoredParticipation, 'timestamp'>) => {
    const newParticipation = {
      ...participation,
      timestamp: new Date().toISOString()
    };

    setLocalParticipations(prev => {
      const updated = [newParticipation, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Traiter les participations
  useEffect(() => {
    if (isLoading) return;

    // Préparer toutes les participations avec les données de base
    const allParticipations = [
      ...localParticipations.map(p => ({
        ...p,
        isLocal: true
      })),
      ...indexerParticipations.map(p => ({
        numbers: p.numbers.map(n => parseInt(n, 10)),
        chain: normalizeNetworkName(p.chain),
        hash: p.id,
        drawNumber: p.drawNumber,
        timestamp: p.timestamp,
        isLocal: false
      }))
    ];

    // Trier et dédupliquer pour obtenir les 5 plus récentes
    const uniqueParticipations = allParticipations
      .filter((participation, index, self) => 
        index === self.findIndex(p => p.hash === participation.hash)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, MAX_HISTORY);

    setProcessedParticipations(uniqueParticipations);
  }, [isLoading, indexerParticipations, localParticipations]);

  const refreshParticipations = useCallback(async () => {
    if (refreshIndexerParticipations) {
      await refreshIndexerParticipations();
    }
  }, [refreshIndexerParticipations]);

  return {
    participations: processedParticipations,
    isLoading,
    addParticipation,
    refreshParticipations
  };
}; 