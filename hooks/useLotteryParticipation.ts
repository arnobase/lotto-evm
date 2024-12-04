import { useState, useCallback, useEffect } from 'react';
import { LotteryContract } from '../components/lottery/results/types';

interface UseLotteryParticipationReturn {
  /** Liste des numéros actuellement sélectionnés */
  selectedNumbers: number[];
  /** Fonction pour mettre à jour les numéros sélectionnés */
  setSelectedNumbers: (numbers: number[]) => void;
  /** Indique si la participation est possible avec les numéros actuels */
  canParticipate: boolean;
  /** Indique si une opération est en cours */
  isLoading: boolean;
  /** Message d'erreur éventuel */
  errorMessage: string;
  /** Fonction pour participer à la loterie */
  participate: () => Promise<void>;
  /** Fonction pour gérer la sélection d'un numéro */
  handleNumberSelect: (number: number) => void;
}

const MAX_SELECTIONS = 4;

/**
 * Hook personnalisé pour gérer la participation à la loterie.
 * Gère la sélection des numéros, la validation et la soumission.
 * 
 * @param contract - Instance du contrat de loterie
 * @returns Un objet contenant l'état et les fonctions de gestion de la participation
 * 
 * @example
 * ```tsx
 * const {
 *   selectedNumbers,
 *   canParticipate,
 *   handleNumberSelect,
 *   participate
 * } = useLotteryParticipation(contract);
 * ```
 */
export const useLotteryParticipation = (
  contract: LotteryContract
): UseLotteryParticipationReturn => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [canParticipate, setCanParticipate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const checkParticipationEligibility = useCallback(async () => {
    if (selectedNumbers.length === MAX_SELECTIONS) {
      const dryRunRes = await contract.dryRun("participate", [selectedNumbers]);
      setCanParticipate(dryRunRes.success);
    } else {
      setCanParticipate(false);
    }
  }, [contract, selectedNumbers]);

  useEffect(() => {
    checkParticipationEligibility();
  }, [checkParticipationEligibility]);

  const handleNumberSelect = (number: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      }
      if (prev.length < MAX_SELECTIONS) {
        return [...prev, number].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const participate = async () => {
    if (selectedNumbers.length < MAX_SELECTIONS) {
      setErrorMessage(`Veuillez sélectionner ${MAX_SELECTIONS} numéros`);
      return;
    }
    
    if (canParticipate) {
      setIsLoading(true);
      setErrorMessage("");
      try {
        await contract.doTx("participate", [selectedNumbers]);
        setSelectedNumbers([]);
      } catch (error) {
        setErrorMessage("Une erreur est survenue lors de la participation");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    selectedNumbers,
    setSelectedNumbers,
    canParticipate,
    isLoading,
    errorMessage,
    participate,
    handleNumberSelect
  };
}; 