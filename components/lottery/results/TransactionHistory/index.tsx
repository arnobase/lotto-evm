import { useState, useMemo } from 'react';
import { TransactionHistoryProps } from '../types';
import NumberBall from '../../../common/NumberBall';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 20;

const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const downloadCSV = (transactions: TransactionHistoryProps['transactions']) => {
  const headers = ['Draw Number', 'Chain', 'Account', 'Numbers'];
  const csvContent = transactions.map(tx => [
    tx.drawNumber,
    tx.chain,
    tx.accountId,
    tx.numbers.join('-')
  ]);

  const csvString = [
    headers.join(','),
    ...csvContent.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'participations.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  onDownload 
}: { 
  currentPage: number; 
  totalPages: number;
  onPageChange: (page: number) => void;
  onDownload: () => void;
}) => (
  <div className="flex justify-between items-center py-4">
    <button
      onClick={onDownload}
      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors duration-200"
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
      <span>Export</span>
    </button>
    <div className="flex items-center gap-4">
      <span className="text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
);

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [selectedDraw, setSelectedDraw] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [accountSearch, setAccountSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredTransactions = transactions.filter(tx => {
    const matchDraw = !selectedDraw || tx.drawNumber === selectedDraw;
    const matchChain = !selectedChain || tx.chain === selectedChain;
    const matchAccount = !accountSearch || tx.accountId.toLowerCase().includes(accountSearch.toLowerCase());
    return matchDraw && matchChain && matchAccount;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedDraw, selectedChain, accountSearch]);

  return (
    <div className="mt-8">
      <div className="grid grid-cols-12 gap-4 mb-6">
        <select
          value={selectedDraw}
          onChange={(e) => setSelectedDraw(e.target.value)}
          className="col-span-2 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All draws</option>
          {drawNumbers.map(draw => (
            <option key={draw} value={draw}>#{draw}</option>
          ))}
        </select>

        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="col-span-3 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          className="col-span-7 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {filteredTransactions.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDownload={() => downloadCSV(filteredTransactions)}
        />
      )}

      <div className="space-y-2 my-4">
        {paginatedTransactions.map((tx) => (
          <div key={tx.hash} className="bg-gray-800 rounded-lg p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-lg font-bold text-emerald-400">#{tx.drawNumber}</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium text-gray-300">{tx.chain}</span>
                <span className="text-gray-400">{formatAddress(tx.accountId)}</span>
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
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            No participations found
          </div>
        )}
      </div>

      {filteredTransactions.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDownload={() => downloadCSV(filteredTransactions)}
        />
      )}
    </div>
  );
};

export default TransactionHistory; 