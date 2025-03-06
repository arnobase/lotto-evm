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
  PlayCircleIcon,
  CurrencyDollarIcon,
  GiftIcon,
  CalendarDaysIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const MenuButton = ({ children, onClick, active = false }: { children: React.ReactNode; onClick: () => void; active?: boolean }) => (
  <button
    onClick={onClick}
    className={`
      relative px-6 py-3 text-base font-semibold rounded-xl
      transition-all duration-200 ease-out
      ${active 
        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg' 
        : 'bg-white hover:bg-emerald-50 text-emerald-700 hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-emerald-400'
      }
    `}
  >
    {children}
  </button>
);

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

            <div className="content-block">
              <div className="flex flex-col items-center justify-center py-6 px-4">
                <div className="w-full max-w-md bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900">
                  <div className="relative mb-6">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/20 to-emerald-300/20 blur-xl"></div>
                    <div className="relative text-4xl font-bold text-center bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                      Jackpot: 10,000 $ASTR
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 text-lg">
                      <CursorArrowRaysIcon className="h-6 w-6 text-emerald-500/70 flex-shrink-0" />
                      <span>Pick 5 numbers to participate</span>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 text-lg">
                      <GiftIcon className="h-6 w-6 text-emerald-500/70 flex-shrink-0" />
                      <span>Free to play</span>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400 text-lg">
                      <CalendarDaysIcon className="h-6 w-6 text-emerald-500/70 flex-shrink-0" />
                      <span>Weekly draws</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 py-2">
              <MenuButton onClick={() => handleTabChange(0)} active={selectedTab === 0}>
                <div className="flex items-center gap-2" data-tab="0">
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${
                    selectedTab === 0
                      ? 'bg-white/20'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50'
                  }`}>
                    <TicketIcon className={`h-5 w-5 transition-transform duration-300 ${
                      selectedTab === 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : 'group-hover:scale-110'
                    }`} />
                  </div>
                  <span>Participate</span>
                </div>
              </MenuButton>
              <MenuButton onClick={() => handleTabChange(1)} active={selectedTab === 1}>
                <div className="flex items-center gap-2" data-tab="1">
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${
                    selectedTab === 1
                      ? 'bg-white/20'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50'
                  }`}>
                    <TrophyIcon className={`h-5 w-5 transition-transform duration-300 ${
                      selectedTab === 1 ? 'animate-[float_3s_ease-in-out_infinite]' : 'group-hover:scale-110'
                    }`} />
                  </div>
                  <span>Results</span>
                </div>
              </MenuButton>
              <MenuButton onClick={() => handleTabChange(2)} active={selectedTab === 2}>
                <div className="flex items-center gap-2" data-tab="2">
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${
                    selectedTab === 2
                      ? 'bg-white/20'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50'
                  }`}>
                    <ClockIcon className={`h-5 w-5 transition-transform duration-300 ${
                      selectedTab === 2 ? 'animate-[tilt_3s_ease-in-out_infinite]' : 'group-hover:scale-110'
                    }`} />
                  </div>
                  <span>History</span>
                </div>
              </MenuButton>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              {selectedTab === 0 && (
                <ParticipationForm contract={{ doQuery, doTx, dryRun }} />
              )}
              {selectedTab === 1 && (
                <>
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