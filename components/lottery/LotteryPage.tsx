import { useState, useEffect, useCallback } from 'react';
import { useContract } from '../../contexts/ContractContext';
import { useWeb3 } from '../../contexts/Web3Context';
import ParticipationForm from './participation/ParticipationForm';
import ResultsDisplay from './results/ResultsDisplay';
import TransactionHistory from './results/TransactionHistory';
import { useLotteryResults } from '../../hooks/useLotteryResults';
import { useLotteryParticipations } from '../../hooks/useLotteryParticipations';

const WalletPrompt = ({ onConnect }: { onConnect: () => Promise<void> }) => (
  <div className="text-center py-12">
    <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Connection Required</h3>
      <p className="text-gray-400 mb-6">
        Please connect your wallet to access the lottery.
      </p>
      <button
        onClick={onConnect}
        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all duration-200"
      >
        Connect Wallet
      </button>
    </div>
  </div>
);

const LotteryPage: React.FC = () => {
  const { doQuery, doTx, dryRun } = useContract();
  const { evmAccount, evmConnectWallet } = useWeb3();
  const [selectedTab, setSelectedTab] = useState<'participate' | 'results'>('participate');
  
  // Hooks for results and participations
  const { drawResults, isLoading: isLoadingResults, error: resultsError, refreshResults } = useLotteryResults();
  const { participations, isLoading: isLoadingParticipations, error: participationsError, refreshParticipations } = useLotteryParticipations();

  // Effect to handle URL hash
  useEffect(() => {
    const tab_hash = window.location.hash.substring(1);
    if (tab_hash === 'results' || tab_hash === 'participate') {
      setSelectedTab(tab_hash);
    }
  }, []);

  // Tab change handler
  const handleTabChange = useCallback((tab: 'participate' | 'results') => {
    window.location.hash = tab;
    setSelectedTab(tab);
  }, []);

  // If user is not connected, show connection prompt
  if (!evmAccount) {
    return <WalletPrompt onConnect={evmConnectWallet} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl">
          <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleTabChange('participate')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                selectedTab === 'participate'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Participate
            </button>
            <button
              onClick={() => handleTabChange('results')}
              className={`flex-1 py-2 px-4 rounded-md transition-all ${
                selectedTab === 'results'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Results
            </button>
          </div>

          <div className="mt-6">
            {selectedTab === 'participate' ? (
              <div>
                <ParticipationForm
                  contract={{ doQuery, doTx, dryRun }}
                />
                {participationsError && (
                  <div className="text-red-500 text-center mt-4 p-4 bg-red-500/10 rounded-lg">
                    {participationsError}
                  </div>
                )}
                {!participationsError && participations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Participation List</h3>
                    <TransactionHistory transactions={participations} />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <ResultsDisplay results={drawResults} isLoading={isLoadingResults} />
                {resultsError && (
                  <div className="text-red-500 text-center mt-4 p-4 bg-red-500/10 rounded-lg">
                    {resultsError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryPage; 