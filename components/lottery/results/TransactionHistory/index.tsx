import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LotteryResult } from '../types';
import NumberBall from '../../../common/NumberBall';
import PaginationControls from '../../../common/PaginationControls';
import { formatAddress } from '../../../../utils/format';
import { useLotteryParticipations } from '../../../../hooks/useLotteryParticipations';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

const TransactionHistory: React.FC = () => {
  const [selectedDraw, setSelectedDraw] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [accountSearch, setAccountSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const {
    participations: transactions,
    totalParticipations: totalCount,
    isLoading,
    loadMore,
    hasNextPage,
    loadedParticipations,
    exportAllParticipations
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
    if (!isLoading && !isLoadingMore && hasNextPage && transactions.length < requiredTransactions) {
      console.log('Loading more data for page', currentPage);
      console.log('Current transactions:', transactions.length);
      console.log('Required transactions:', requiredTransactions);
      setIsLoadingMore(true);
      loadMore()
        .then(() => {
          console.log('Loaded more data successfully');
        })
        .catch((error) => {
          console.error('Error loading more data:', error);
        })
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [currentPage, hasNextPage, transactions.length, isLoading, isLoadingMore, loadMore]);

  // Mise à jour de la page courante si elle dépasse le total
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, totalCount]);

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
    const controller = new AbortController();
    setAbortController(controller);

    const exportToastId = toast.loading(
      <div className="flex items-center gap-2">
        <div>Preparing export...</div>
        <button
          onClick={() => {
            controller.abort();
            setAbortController(null);
            toast.dismiss(exportToastId);
            toast.error('Export cancelled');
            setIsExporting(false);
          }}
          className="ml-2 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>,
      { duration: Infinity }
    );

    try {
      const allData = await exportAllParticipations(
        (loaded, total) => {
          if (controller.signal.aborted) {
            throw new Error('Export cancelled');
          }
          toast.loading(
            <div className="flex items-center gap-2">
              <div>Loading data... {loaded}/{total}</div>
              <button
                onClick={() => {
                  controller.abort();
                  setAbortController(null);
                  toast.dismiss(exportToastId);
                  toast.error('Export cancelled');
                  setIsExporting(false);
                }}
                className="ml-2 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>,
            { id: exportToastId }
          );
        },
        controller.signal
      );

      if (!controller.signal.aborted) {
        downloadCSV(allData.map(node => ({
          numbers: node.numbers.map(n => parseInt(n, 10)),
          transactionHash: node.id,
          hash: node.id,
          drawNumber: node.drawNumber,
          chain: node.chain,
          accountId: node.accountId
        })), generateExportFilename());

        toast.success(
          <div className="flex items-center justify-between gap-2">
            <div>{`Export completed! ${allData.length} records exported`}</div>
            <button
              onClick={() => toast.dismiss(exportToastId)}
              className="ml-2 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>,
          { id: exportToastId, duration: 5000 }
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Export cancelled') {
        // L'export a été annulé, le message a déjà été affiché
      } else {
        console.error('Export error:', error);
        toast.error('Export failed', { id: exportToastId });
      }
    } finally {
      setIsExporting(false);
      setAbortController(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    console.log('Changing to page', newPage);
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, transactions.length);
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Vérifier si la page actuelle a des données ou est en cours de chargement
  const hasDataOnCurrentPage = paginatedTransactions.length > 0;
  const isLoadingNextPage = isLoading || (isLoadingMore && startIndex >= transactions.length);
  const canLoadMore = hasNextPage || currentPage * ITEMS_PER_PAGE < totalCount;

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
          onPageChange={handlePageChange}
          onDownload={handleExport}
          totalResults={totalCount}
          displayedResults={transactions.length}
          isExporting={isExporting}
          hasNextPage={canLoadMore}
          isLoadingMore={isLoadingMore}
        />
      )}

      <div className="space-y-2 my-4">
        {isLoadingNextPage ? (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            Loading page {currentPage}...
          </div>
        ) : hasDataOnCurrentPage ? (
          paginatedTransactions.map((tx) => (
            <div key={tx.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">#{tx.drawNumber}</span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">{tx.chain}</span>
                  <span className="text-gray-600 dark:text-gray-400">{formatAddress(tx.accountId)}</span>
                </div>
                <div className="flex gap-2 flex-wrap justify-end mt-4 sm:mt-0">
                  {tx.numbers.map((number, index) => (
                    <NumberBall
                      key={`${tx.id}-${index}`}
                      number={parseInt(number, 10)}
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
            No participations found on this page
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onDownload={handleExport}
          totalResults={totalCount}
          displayedResults={transactions.length}
          isExporting={isExporting}
          hasNextPage={canLoadMore}
          isLoadingMore={isLoadingMore}
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