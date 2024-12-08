import React from 'react';
import NumberBall from '../../../common/NumberBall';
import { formatAddress } from '../../../../utils/format';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { NETWORKS } from '../../../../libs/constants';
import { useLastParticipations, CombinedParticipation } from '../../../../hooks/useLastParticipations';

const LastParticipation: React.FC = () => {
  const { participations, isLoading } = useLastParticipations();

  const getExplorerUrl = (chain: string, hash: string): string => {
    const network = NETWORKS.find(net => net.name === chain);
    return network?.type === 'EVM' && network.info.blockExplorerUrls?.[0]
      ? `${network.info.blockExplorerUrls[0]}/tx/${hash}`
      : '#';
  };

  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-emerald-600 dark:text-emerald-400">
          Last Participations
        </h3>
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
      <h3 className="text-lg font-semibold mb-4 text-emerald-600 dark:text-emerald-400">
        Last Participations
      </h3>
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
            <div className="flex items-center gap-4 flex-1 justify-end">
              {participation.timestamp && (
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {participation.timestamp}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {participation.chain}
              </span>
              {participation.drawNumber && (
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 rounded-full text-sm font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                  Draw #{participation.drawNumber}
                </span>
              )}
              <a
                href={getExplorerUrl(participation.chain, participation.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
              >
                {formatAddress(participation.hash)}
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LastParticipation; 