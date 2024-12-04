import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ParticipationFormProps } from './types';
import NumberSelector from './NumberSelector';
import SubmitButton from './SubmitButton';
import LastParticipation from './LastParticipation';
import { renderTransactionToast } from '../../../common/Toast/TransactionToast';

const MAX_SELECTIONS = 4;

const ParticipationForm: React.FC<ParticipationFormProps> = ({ contract }) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [canParticipate, setCanParticipate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastParticipation, setLastParticipation] = useState<number[]>([]);

  const checkDryRun = useCallback(async () => {
    if (selectedNumbers.length === MAX_SELECTIONS) {
      console.log('Checking dry run with numbers:', selectedNumbers);
      const dryRunRes = await contract.dryRun("participate", [selectedNumbers]);
      console.log('Dry run result:', dryRunRes);
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
    if (isLoading) {
      console.log('Already loading, skipping participation');
      return;
    }
    if (selectedNumbers.length < MAX_SELECTIONS) {
      setErrorMessage(`Please select ${MAX_SELECTIONS} numbers`);
      return;
    }
    
    if (canParticipate) {
      const toastId = toast.loading("Sending transaction...", {
        duration: Infinity
      });
      
      try {
        console.log('Starting participation with numbers:', selectedNumbers);
        setIsLoading(true);
        setErrorMessage("");

        console.log('Calling contract.doTx...');
        const tx = await contract.doTx({
          method: "participate",
          args: [selectedNumbers],
          toastId: toastId.toString()
        });
        console.log('Transaction completed successfully:', tx);

        if (tx?.hash) {
          setLastParticipation([...selectedNumbers]);
        }
        setSelectedNumbers([]);
      } catch (error) {
        console.error("Participation error:", error);
        if (error instanceof Error && 
            (error.message.includes('user rejected') || 
             error.message.includes('User denied transaction'))) {
          console.log('Updating toast for cancellation - toastId:', toastId);
          toast.error('Transaction cancelled', { 
            id: toastId, 
            duration: 4000
          });
        }
      } finally {
        console.log('Setting loading state to false');
        setIsLoading(false);
      }
    } else {
      console.log('Cannot participate: dry run check failed');
    }
  };

  return (
    <div className="space-y-6">
      <NumberSelector
        selectedNumbers={selectedNumbers}
        onNumberSelect={handleNumberSelect}
        maxSelections={MAX_SELECTIONS}
      />
      
      <SubmitButton
        canParticipate={canParticipate}
        onParticipate={handleParticipate}
        isLoading={isLoading}
      />
      
      {errorMessage && (
        <div className="text-red-500 text-center mt-2 text-sm">
          {errorMessage}
        </div>
      )}

      {lastParticipation.length > 0 && (
        <LastParticipation numbers={lastParticipation} />
      )}
    </div>
  );
};

export default ParticipationForm; 