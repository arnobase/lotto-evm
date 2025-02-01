import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDownload: () => void;
  totalResults: number;
  displayedResults: number;
  isExporting?: boolean;
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onDownload,
  totalResults,
  displayedResults,
  isExporting = false,
  hasNextPage = false,
  isLoadingMore = false
}) => (
  <div className="flex justify-between items-center py-4">
    <button
      onClick={onDownload}
      disabled={isExporting}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
        isExporting
          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600'
      }`}
    >
      <ArrowDownTrayIcon className={`h-5 w-5 ${isExporting ? 'animate-bounce' : ''}`} />
      <span>{isExporting ? 'Exporting...' : 'Export'}</span>
    </button>

    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages} ({displayedResults}/{totalResults} results)
        {isLoadingMore && <span className="ml-2">Loading more...</span>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
            currentPage === 1
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600'
          }`}
        >
          Previous
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage && currentPage >= totalPages}
          className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
            !hasNextPage && currentPage >= totalPages
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  </div>
);

export default PaginationControls; 