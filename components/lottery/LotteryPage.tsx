import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useContract } from '../../contexts/ContractContext';
import { useLotteryResults } from '../../hooks/useLotteryResults';
import { useLotteryParticipations } from '../../hooks/useLotteryParticipations';
import { useCurrentDraw } from '../../hooks/useCurrentDraw';
import ParticipationForm from './participation/ParticipationForm';
import ResultsDisplay from './results/ResultsDisplay';
import TransactionHistory from './results/TransactionHistory';
import LiveDraw from './LiveDraw';
import { useLiveDraw } from '../../hooks/useLiveDraw';
import { 
  TicketIcon, 
  TrophyIcon, 
  ClockIcon,
  PlayCircleIcon
} from '@heroicons/react/24/outline';

const LotteryPage: React.FC = () => {
  const { evmAccount } = useWeb3();
  const { doQuery, doTx, dryRun } = useContract();
  const { drawResults, isLoading: resultsLoading } = useLotteryResults();
  const { totalParticipations } = useLotteryParticipations();
  const { shouldShow, numbers, onComplete, showLiveDraw } = useLiveDraw();
  const { drawNumber } = useCurrentDraw();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {shouldShow && (
        <LiveDraw
          winningNumbers={numbers}
          onComplete={onComplete}
          drawNumber={drawNumber?.toString() || '0'}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center transform rotate-[-5deg] hover:rotate-[5deg] transition-transform duration-300">
                  <TicketIcon className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 to-emerald-300/20 blur-xl"></div>
                  <h1 className="relative text-7xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 inline-block text-transparent bg-clip-text">
                      Lotto
                    </span>
                  </h1>
                </div>
              </div>
              {drawNumber && (
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    Draw #{drawNumber}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === 0
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                }`}
                onClick={() => handleTabChange(0)}
              >
                <TicketIcon className="h-5 w-5" />
                <span>Participate</span>
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                }`}
                onClick={() => handleTabChange(1)}
              >
                <TrophyIcon className="h-5 w-5" />
                <span>Results</span>
              </button>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === 2
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                }`}
                onClick={() => handleTabChange(2)}
              >
                <ClockIcon className="h-5 w-5" />
                <span>History</span>
                {totalParticipations > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full">
                    {totalParticipations}
                  </span>
                )}
              </button>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              {selectedTab === 0 && (
                <ParticipationForm contract={{ doQuery, doTx, dryRun }} />
              )}
              {selectedTab === 1 && (
                <>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={showLiveDraw}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <PlayCircleIcon className="h-5 w-5" />
                      Show Live Draw
                    </button>
                  </div>
                  <ResultsDisplay
                    results={drawResults}
                    isLoading={false}
                  />
                </>
              )}
              {selectedTab === 2 && (
                <TransactionHistory />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryPage; 