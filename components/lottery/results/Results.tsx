import React, { useState, useCallback } from 'react';
import { useLotteryParticipations } from '../../../hooks/useLotteryParticipations';
import { ResultsTable } from './ResultsTable';
import { ResultsFilter } from './ResultsFilter';
import { useAccount } from 'wagmi';
import { useNetwork } from 'wagmi';
import { TicketIcon } from '@heroicons/react/24/outline';

export const Results: React.FC = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [filter, setFilter] = useState({
    drawNumber: '',
    chain: '',
    accountId: ''
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    participations,
    isLoading,
    error,
    totalParticipations,
    loadedParticipations,
    hasNextPage,
    loadMore
  } = useLotteryParticipations({
    drawNumber: filter.drawNumber || undefined,
    chain: filter.chain || undefined,
    accountId: filter.accountId || undefined
  });

  const handleScroll = useCallback(async (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const threshold = scrollHeight - clientHeight;
    
    if (scrollTop >= threshold * 0.8 && !isLoadingMore && hasNextPage) {
      setIsLoadingMore(true);
      try {
        const result = await loadMore();
        console.log('Loaded more data:', {
          success: !!result?.data,
          newCount: result?.data?.participations?.nodes?.length,
          totalCount: result?.data?.participations?.totalCount,
          hasMore: result?.data?.participations?.pageInfo?.hasNextPage
        });
      } catch (error) {
        console.error('Error loading more:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, hasNextPage, loadMore]);

  const loadingProgress = totalParticipations > 0 
    ? Math.round((loadedParticipations / totalParticipations) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3 px-6 py-4">
          <TicketIcon className="h-8 w-8 text-emerald-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lottery Results
            </h1>
            {filter.drawNumber && (
              <p className="text-gray-600 dark:text-gray-400">
                Draw #{filter.drawNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      <ResultsFilter
        filter={filter}
        onFilterChange={setFilter}
        disabled={isLoading}
      />
      
      <div
        className="flex-1 overflow-auto relative min-h-0"
        onScroll={handleScroll}
      >
        {error ? (
          <div className="text-center text-red-500">
            {error}
          </div>
        ) : (
          <>
            <ResultsTable results={participations} />
            {(isLoading || isLoadingMore) && (
              <div className="flex flex-col items-center justify-center py-4 gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {isLoading ? 'Loading participations...' : `Loading more... ${loadingProgress}%`}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 