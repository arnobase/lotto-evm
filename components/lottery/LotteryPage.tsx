import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useContract } from '../../contexts/ContractContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { useLotteryResults } from '../../hooks/useLotteryResults';
import { useLotteryParticipations } from '../../hooks/useLotteryParticipations';
import ParticipationForm from './participation/ParticipationForm';
import ResultsDisplay from './results/ResultsDisplay';
import TransactionHistory from './results/TransactionHistory';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const LotteryPage = () => {
  const { evmAccount } = useWeb3();
  const { doQuery, doTx, dryRun } = useContract();
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    drawResults,
    isLoading: resultsLoading,
    error: resultsError,
    refreshResults
  } = useLotteryResults();

  const {
    participations,
    isLoading: participationsLoading,
    error: participationsError,
    refreshParticipations
  } = useLotteryParticipations();

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    if (index === 1) {
      refreshResults();
    } else if (index === 2) {
      refreshParticipations();
    }
  };

  if (!evmAccount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Welcome to Lotto
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Please connect your wallet to participate
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-200 dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-300 dark:border-gray-700">
          <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
            <Tab.List className="flex space-x-1 rounded-xl bg-white dark:bg-gray-700 p-1 shadow-sm">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-emerald-400 dark:bg-emerald-600 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                  )
                }
              >
                Participate
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-emerald-400 dark:bg-emerald-600 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                  )
                }
              >
                Results
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-emerald-400 dark:bg-emerald-600 text-white shadow'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                  )
                }
              >
                History
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-8">
              <Tab.Panel>
                <div>
                  <ParticipationForm
                    contract={{
                      doQuery,
                      doTx,
                      dryRun
                    }}
                  />
                  {participationsError && (
                    <div className="text-red-500 text-center mt-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
                      {participationsError}
                    </div>
                  )}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <ResultsDisplay
                  results={drawResults}
                  isLoading={resultsLoading}
                />
                {resultsError && (
                  <div className="text-red-500 text-center mt-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    {resultsError}
                  </div>
                )}
              </Tab.Panel>
              <Tab.Panel>
                <TransactionHistory
                  transactions={participations}
                />
                {participationsError && (
                  <div className="text-red-500 text-center mt-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    {participationsError}
                  </div>
                )}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default LotteryPage; 