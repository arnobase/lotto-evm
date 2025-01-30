import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ParticipationFormProps } from './types';
import NumberSelector from './NumberSelector';
import SubmitButton from './SubmitButton';
import LastParticipation from './LastParticipation';
import { useWeb3 } from '../../../../contexts/Web3Context';
import { useLastParticipations } from '../../../../hooks/useLastParticipations';
import { useCurrentDraw } from '../../../../hooks/useCurrentDraw';

const MAX_SELECTIONS = 5;

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
  const { evmNetwork, evmAccount, evmConnectWallet } = useWeb3();
  const { refreshParticipations, addParticipation } = useLastParticipations();
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

        if (tx?.hash) {
          addParticipation({
            numbers: selectedNumbers,
            chain: evmNetwork || 'unknown',
            hash: tx.hash,
            drawNumber: drawNumber || undefined
          });
        }

        setSelectedNumbers([]);
        setRefreshKey(prev => prev + 1);
        
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

  const showConnectMessage = selectedNumbers.length === MAX_SELECTIONS && !evmAccount;

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
      {showConnectMessage && (
        <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 rounded-lg border border-purple-100 dark:border-purple-800">
          <p className="text-lg font-medium text-purple-700 dark:text-purple-300 text-center">
            🎮 Ready to play? One last step!
          </p>
          <p className="text-purple-600 dark:text-purple-400 text-center">
            Connect your wallet to try your luck with these numbers!
          </p>
          <button
            onClick={evmConnectWallet}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Connect Wallet
          </button>
        </div>
      )}
      <SubmitButton
        canParticipate={canParticipate && !!evmAccount}
        onParticipate={handleParticipate}
        isLoading={isLoading}
      />
      <LastParticipation key={refreshKey} />
    </div>
  );
};

export default ParticipationForm; 