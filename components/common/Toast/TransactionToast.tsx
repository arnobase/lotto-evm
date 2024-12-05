import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface TransactionToastProps {
  type: 'loading' | 'success' | 'error';
  message: string;
  explorerUrl?: string;
}

export const TransactionToast: React.FC<TransactionToastProps> = ({
  type,
  message,
  explorerUrl
}) => {
  if (type === 'loading') {
    return <div className="font-medium">Processing transaction...</div>;
  }

  if (type === 'success' && explorerUrl) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium">{message}</div>
          <button
            onClick={() => toast.dismiss()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-inherit hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
        >
          View on explorer
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return <div className="font-medium">{message}</div>;
};

export const renderTransactionToast = (
  type: 'loading' | 'success' | 'error',
  message: string,
  explorerUrl?: string
) => {
  return <TransactionToast type={type} message={message} explorerUrl={explorerUrl} />;
}; 