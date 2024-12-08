import { useState, useEffect, useCallback } from 'react';
import { useLotteryParticipations } from './useLotteryParticipations';
import { useWeb3 } from '../contexts/Web3Context';

const STORAGE_KEY = 'lotto-participation-history';
const MAX_HISTORY = 5;

// Mapping des noms de réseaux entre l'indexeur et notre configuration
const NETWORK_NAME_MAPPING: { [key: string]: string } = {
  'lotto_Minato': 'Minato',
  'Moonbase Alpha': 'Moonbase',
  'lotto_Shibuya': 'Shibuya',
  // Ajout des mappings inverses pour la cohérence
  'Minato': 'Minato',
  'Moonbase': 'Moonbase',
  'Shibuya': 'Shibuya'
};

// Fonction utilitaire pour normaliser les noms de réseaux
const normalizeNetworkName = (chain: string): string => {
  console.log('Normalizing network name:', chain);
  const normalized = NETWORK_NAME_MAPPING[chain] || chain;
  console.log('Normalized to:', normalized);
  return normalized;
};

interface StoredParticipation {
  numbers: number[];
  chain: string;
  hash: string;
  timestamp: string;
  drawNumber?: string;
}

export interface CombinedParticipation extends StoredParticipation {
  timestamp?: string;
}

const formatDate = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const useLastParticipations = () => {
  const { evmAccount } = useWeb3();
  const [localParticipations, setLocalParticipations] = useState<StoredParticipation[]>([]);
  const { 
    participations: indexerParticipations, 
    isLoading,
    refreshParticipations 
  } = useLotteryParticipations({
    accountId: evmAccount?.address
  });

  // Charger l'historique local
  const loadLocalHistory = useCallback(() => {
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

  // Ajouter une nouvelle participation immédiatement
  const addParticipation = useCallback((participation: Omit<StoredParticipation, 'timestamp'>) => {
    const newParticipation = {
      ...participation,
      timestamp: formatDate(new Date())
    };

    setLocalParticipations(prev => {
      const updated = [newParticipation, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Charger l'historique local au montage
  useEffect(() => {
    loadLocalHistory();
  }, [loadLocalHistory]);

  // Combiner les participations locales et de l'indexeur
  const participations = [
    ...localParticipations,
    ...indexerParticipations.map(p => {
      console.log('Processing indexer participation:', p);
      const normalized = {
        numbers: p.numbers.map(n => parseInt(n, 10)),
        chain: normalizeNetworkName(p.chain),
        hash: p.hash,
        drawNumber: p.drawNumber,
        timestamp: p.timestamp
      };
      console.log('Normalized participation:', normalized);
      return normalized;
    })
  ]
  // Dédupliquer par hash
  .filter((participation, index, self) => 
    index === self.findIndex(p => p.hash === participation.hash)
  )
  // Trier par timestamp décroissant
  .sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  })
  // Prendre les 5 plus récentes
  .slice(0, MAX_HISTORY);

  const refresh = useCallback(async () => {
    await refreshParticipations();
  }, [refreshParticipations]);

  return {
    participations,
    isLoading,
    refresh,
    addParticipation
  };
}; 