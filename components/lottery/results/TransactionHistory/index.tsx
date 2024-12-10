import React, { useState, useEffect, useMemo } from 'react';
import { useWeb3 } from '../../../../contexts/Web3Context';
import { useLotteryParticipations } from '../../../../hooks/useLotteryParticipations';
import { formatAddress } from '../../../../utils/format';
import { XMarkIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import NumberBall from '../../../common/NumberBall';
import PaginationControls from '../../../common/PaginationControls';

const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = 'lotto-history-filters';

const TransactionHistory: React.FC = () => {
  const { evmAccount } = useWeb3();
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Charger le viewMode sauvegardé
  const loadSavedViewMode = () => {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      if (savedFilters) {
        const { viewMode } = JSON.parse(savedFilters);
        return viewMode || 'all';
      }
    } catch (error) {
      console.error('Error loading saved view mode:', error);
    }
    return 'all';
  };

  const [viewMode, setViewMode] = useState<'all' | 'mine'>(loadSavedViewMode());
  const [selectedDraw, setSelectedDraw] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [accountSearch, setAccountSearch] = useState('');

  // Sauvegarder le viewMode quand il change
  useEffect(() => {
    const filters = { viewMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [viewMode]);

  // Réinitialiser la page quand on change de mode
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Requête principale pour les participations
  const {
    participations,
    isLoading,
    totalParticipations,
    loadedParticipations,
    hasNextPage,
    loadMore
  } = useLotteryParticipations({
    drawNumber: selectedDraw || undefined,
    chain: selectedChain || undefined,
    accountId: viewMode === 'mine' ? evmAccount?.address : accountSearch || undefined
  });

  // Requêtes séparées pour les compteurs
  const { totalParticipations: totalCount } = useLotteryParticipations({});
  const { totalParticipations: userCount } = useLotteryParticipations({
    accountId: evmAccount?.address
  });

  // Get unique draw numbers and chains
  const { drawNumbers, chains } = useMemo(() => {
    const draws = new Set<string>();
    const chainSet = new Set<string>();

    participations.forEach(p => {
      if (p.drawNumber) draws.add(p.drawNumber);
      if (p.chain) chainSet.add(p.chain);
    });

    return {
      drawNumbers: Array.from(draws).sort((a, b) => parseInt(b) - parseInt(a)),
      chains: Array.from(chainSet).sort()
    };
  }, [participations]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, participations.length);
  const paginatedParticipations = participations.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalParticipations / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setViewMode('all')}
            className={`group flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
              viewMode === 'all'
                ? 'bg-emerald-500 text-white scale-105 shadow-lg hover:bg-emerald-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:scale-105'
            }`}
          >
            <GlobeAltIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            <span>All participations</span>
            <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 text-xs font-bold rounded-full transition-colors duration-300 ${
              viewMode === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
            }`}>
              {totalCount}
            </span>
          </button>
          <button
            onClick={() => setViewMode('mine')}
            data-filter="my"
            className={`group flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
              viewMode === 'mine'
                ? 'bg-emerald-500 text-white scale-105 shadow-lg hover:bg-emerald-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:scale-105'
            }`}
          >
            <UserIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            <span>My participations</span>
            <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 text-xs font-bold rounded-full transition-colors duration-300 ${
              viewMode === 'mine'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
            }`}>
              {userCount}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
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
            disabled={viewMode === 'mine'}
          />
        </div>

        <div className="space-y-2 my-4">
          {isLoading ? (
            <div className="text-center py-4 text-gray-600 dark:text-gray-400">
              Loading...
            </div>
          ) : paginatedParticipations.length > 0 ? (
            paginatedParticipations.map((participation) => (
              <div key={participation.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">#{participation.drawNumber}</span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">{participation.chain}</span>
                    <span className="text-gray-600 dark:text-gray-400">{formatAddress(participation.accountId)}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end mt-4 sm:mt-0">
                    {participation.numbers.map((number, index) => (
                      <NumberBall
                        key={`${participation.id}-${index}`}
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
              No participations found
            </div>
          )}
        </div>

        {participations.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onDownload={() => {}}
            totalResults={totalParticipations}
            displayedResults={loadedParticipations}
            isExporting={isExporting}
            hasNextPage={hasNextPage}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionHistory; 