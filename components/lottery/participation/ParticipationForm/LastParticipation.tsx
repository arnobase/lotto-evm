import React from 'react';
import NumberBall from '../../../common/NumberBall';
import { ArrowTopRightOnSquareIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { NETWORKS } from '../../../../libs/constants';
import { useLastParticipations, CombinedParticipation } from '../../../../hooks/useLastParticipations';

const LastParticipation: React.FC = () => {
  const { participations, isLoading } = useLastParticipations();

  const getExplorerUrl = (chain: string, hash: string): string => {
    const network = NETWORKS.find(net => net.name === chain);
    if (!network?.info.blockExplorerUrls?.[0]) return '#';
    const baseUrl = network.info.blockExplorerUrls[0].replace(/\/$/, '');
    return `${baseUrl}/tx/${hash}`;
  };

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            My last participations
          </h3>
          <button
            disabled
            className="text-emerald-400 dark:text-emerald-600 text-sm font-medium flex items-center gap-1 opacity-50 cursor-not-allowed"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (participations.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          My last participations
        </h3>
        <button
          onClick={() => {
            const historyTab = document.querySelector('[data-tab="2"]');
            if (historyTab) {
              (historyTab as HTMLElement).click();
              // Petit délai pour laisser le temps à l'onglet de charger
              setTimeout(() => {
                const myParticipationsButton = document.querySelector('[data-filter="my"]');
                if (myParticipationsButton) {
                  (myParticipationsButton as HTMLElement).click();
                }
              }, 100);
            }
          }}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium flex items-center gap-1"
        >
          View all
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {participations.map((participation: CombinedParticipation, index: number) => (
          <div key={participation.hash} className="flex items-center gap-4">
            <div className="flex gap-2 flex-wrap min-w-[160px]">
              {participation.numbers.map((number: number, numIndex: number) => (
                <NumberBall
                  key={numIndex}
                  number={number}
                  selected={true}
                  size="sm"
                  onClick={() => {}}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              {participation.timestamp && (
                participation.isLocal && participation.hash ? (
                  <a
                    href={getExplorerUrl(participation.chain, participation.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
                  >
                    <span 
                      className="text-xs cursor-help"
                      title={formatDateTime(participation.timestamp)}
                    >
                      {getRelativeTime(participation.timestamp)} ({new Date(participation.timestamp).toLocaleString('en-US', {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                      })})
                    </span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                ) : (
                  <span 
                    className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap cursor-help"
                    title={formatDateTime(participation.timestamp)}
                  >
                    {getRelativeTime(participation.timestamp)} ({new Date(participation.timestamp).toLocaleString('en-US', {
                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: false
                    })})
                  </span>
                )
              )}
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[80px] text-center">
                {participation.chain}
              </span>
              {participation.drawNumber && (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 rounded-full text-sm font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap min-w-[80px] text-center">
                  Draw #{participation.drawNumber}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LastParticipation; 