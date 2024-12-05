import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ParticipationFormProps } from './types';
import NumberSelector from './NumberSelector';
import SubmitButton from './SubmitButton';
import LastParticipation from './LastParticipation';
import { useWeb3 } from '../../../../contexts/Web3Context';
import { useLastParticipations } from '../../../../hooks/useLastParticipations';
import { useCurrentDraw } from '../../../../hooks/useCurrentDraw';

const MAX_SELECTIONS = 4;

const toastStyle = {
  style: {
    background: 'var(--toast-background)',
    color: 'var(--toast-text)',
    border: '1px solid var(--toast-border)'
  },
  iconTheme: {
    primary: 'var(--toast-icon)',
    secondary: 'var(--toast-icon-background)'
  },
  className: 'custom-toast'
};

const ParticipationForm: React.FC<ParticipationFormProps> = ({ contract }) => {
  const { evmNetwork } = useWeb3();
  const { refresh: refreshParticipations, addParticipation } = useLastParticipations();
  const { drawNumber } = useCurrentDraw();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [canParticipate, setCanParticipate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const checkDryRun = useCallback(async () => {
    if (selectedNumbers.length === MAX_SELECTIONS) {
      const dryRunRes = await contract.dryRun("participate", [selectedNumbers]);
      setCanParticipate(dryRunRes.success);
    } else {
      setCanParticipate(false);
    }
  }, [contract, selectedNumbers]);

  useEffect(() => {
    checkDryRun();
    if (selectedNumbers.length === MAX_SELECTIONS) {
      setErrorMessage("");
    }
  }, [checkDryRun, selectedNumbers.length]);

  const handleNumberSelect = (number: number) => {
    if (isLoading) return;
    
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

  const handleParticipate = async () => {
    if (isLoading) return;
    
    if (selectedNumbers.length < MAX_SELECTIONS) {
      setErrorMessage(`Please select ${MAX_SELECTIONS} numbers`);
      return;
    }
    
    if (canParticipate) {
      const toastId = toast.loading("Sending transaction...", {
        duration: Infinity,
        ...toastStyle
      });
      
      try {
        setIsLoading(true);
        setErrorMessage("");

        const tx = await contract.doTx({
          method: "participate",
          args: [selectedNumbers],
          toastId: toastId.toString()
        });

        // Ajouter immédiatement à l'historique local
        if (tx?.hash) {
          addParticipation({
            numbers: selectedNumbers,
            chain: evmNetwork || 'unknown',
            hash: tx.hash,
            drawNumber: drawNumber || undefined
          });
        }

        setSelectedNumbers([]);
        
        // Forcer le rafraîchissement du composant
        setRefreshKey(prev => prev + 1);
        
        // Rafraîchir l'indexeur en arrière-plan
        setTimeout(() => {
          refreshParticipations();
        }, 2000);
      } catch (error) {
        if (error instanceof Error && 
            (error.message.includes('user rejected') || 
             error.message.includes('User denied transaction'))) {
          toast.dismiss(toastId);
          toast.error("Transaction cancelled", toastStyle);
        } else {
          toast.error("Transaction failed", { id: toastId, ...toastStyle });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <NumberSelector
        selectedNumbers={selectedNumbers}
        onNumberSelect={handleNumberSelect}
        maxSelections={MAX_SELECTIONS}
      />
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
      <SubmitButton
        canParticipate={canParticipate}
        onParticipate={handleParticipate}
        isLoading={isLoading}
      />
      <LastParticipation key={refreshKey} />
    </div>
  );
}

export default ParticipationForm; 