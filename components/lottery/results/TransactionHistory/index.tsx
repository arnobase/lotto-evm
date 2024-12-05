import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LotteryResult } from '../types';
import NumberBall from '../../../common/NumberBall';
import PaginationControls from '../../../common/PaginationControls';
import { formatAddress } from '../../../../utils/format';
import { useLotteryParticipations } from '../../../../hooks/useLotteryParticipations';
import { useApolloClient, ApolloQueryResult } from '@apollo/client';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

interface ExportQueryResult {
  data: {
    participations: {
      nodes: {
        id: string;
        drawNumber: string;
        accountId: string;
        numbers: number[];
        chain: string;
      }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      totalCount: number;
    };
  };
}

const TransactionHistory: React.FC = () => {
  const [selectedDraw, setSelectedDraw] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [accountSearch, setAccountSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const client = useApolloClient();

  const {
    participations: transactions,
    totalParticipations: totalCount,
    isLoading,
    loadMore,
    hasNextPage,
    loadedParticipations,
    getQueryVariables
  } = useLotteryParticipations({
    drawNumber: selectedDraw || undefined,
    chain: selectedChain || undefined,
    accountId: accountSearch || undefined
  });

  // Get unique draw numbers and chains
  const { drawNumbers, chains } = useMemo(() => {
    const draws = new Set<string>();
    const chainSet = new Set<string>();
    
    transactions.forEach(tx => {
      draws.add(tx.drawNumber);
      chainSet.add(tx.chain);
    });

    return {
      drawNumbers: Array.from(draws).sort((a, b) => parseInt(b) - parseInt(a)),
      chains: Array.from(chainSet).sort()
    };
  }, [transactions]);

  // Load more data when needed
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) return;
    setIsLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNextPage, loadMore]);

  // Check if we need to load more data
  useEffect(() => {
    const requiredTransactions = currentPage * ITEMS_PER_PAGE;
    if (!isLoading && !isLoadingMore && hasNextPage && loadedParticipations < requiredTransactions) {
      handleLoadMore();
    }
  }, [currentPage, hasNextPage, loadedParticipations, isLoading, isLoadingMore, handleLoadMore]);

  const generateExportFilename = () => {
    const parts = ['participations'];
    
    if (selectedDraw) {
      parts.push(`draw-${selectedDraw}`);
    }
    if (selectedChain) {
      parts.push(`chain-${selectedChain.toLowerCase()}`);
    }
    if (accountSearch) {
      parts.push(`address-${accountSearch}`);
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    parts.push(timestamp);
    
    return `${parts.join('_')}.csv`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    const exportToastId = toast.loading('Preparing export...');

    try {
      let allData: LotteryResult[] = [];
      let hasMore = true;
      let after: string | null = null;
      const variables = getQueryVariables();

      while (hasMore) {
        const result = await client.query<ExportQueryResult['data']>({
          query: variables.query,
          variables: {
            ...variables.variables,
            after
          }
        });

        const nodes = result.data.participations.nodes;
        allData = [...allData, ...nodes.map(node => ({
          numbers: node.numbers,
          transactionHash: node.id,
          hash: node.id,
          drawNumber: node.drawNumber,
          chain: node.chain,
          accountId: node.accountId
        }))];

        hasMore = result.data.participations.pageInfo.hasNextPage;
        after = result.data.participations.pageInfo.endCursor;

        toast.loading(
          `Loading data... ${allData.length}/${result.data.participations.totalCount}`,
          { id: exportToastId }
        );
      }

      downloadCSV(allData, generateExportFilename());
      toast.success('Export completed!', { id: exportToastId });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', { id: exportToastId });
    } finally {
      setIsExporting(false);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="mt-8">
      <div className="grid grid-cols-12 gap-4 mb-6">
        <select
          value={selectedDraw}
          onChange={(e) => setSelectedDraw(e.target.value)}
          className="col-span-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All draws</option>
          {drawNumbers.map(draw => (
            <option key={draw} value={draw}>#{draw}</option>
          ))}
        </select>

        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="col-span-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All chains</option>
          {chains.map(chain => (
            <option key={chain} value={chain}>{chain}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by address..."
          value={accountSearch}
          onChange={(e) => setAccountSearch(e.target.value)}
          className="col-span-7 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {transactions.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDownload={handleExport}
          totalResults={totalCount}
          displayedResults={loadedParticipations}
          isExporting={isExporting}
        />
      )}

      <div className="space-y-2 my-4">
        {isLoading && transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            Loading...
          </div>
        ) : transactions.length > 0 ? (
          paginatedTransactions.map((tx) => (
            <div key={tx.hash} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">#{tx.drawNumber}</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">{tx.chain}</span>
                  <span className="text-gray-600 dark:text-gray-400">{formatAddress(tx.accountId)}</span>
                </div>
                <div className="flex gap-2 flex-wrap justify-end mt-4 sm:mt-0">
                  {tx.numbers.map((number, index) => (
                    <NumberBall
                      key={`${tx.hash}-${index}`}
                      number={number}
                      selected={true}
                      onClick={() => {}}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            No participations found
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDownload={handleExport}
          totalResults={totalCount}
          displayedResults={loadedParticipations}
          isExporting={isExporting}
        />
      )}
    </div>
  );
};

const downloadCSV = (transactions: LotteryResult[], filename: string) => {
  const headers = ['Draw Number', 'Chain', 'Account', 'Numbers'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(tx => [
      tx.drawNumber,
      tx.chain,
      tx.accountId,
      tx.numbers.join(' ')
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default TransactionHistory; 