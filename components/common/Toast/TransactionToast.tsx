import React from 'react';
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
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-white hover:text-emerald-300 transition-colors"
        >
          Transaction successful! View in block explorer
        </a>
        <button
          onClick={() => toast.dismiss()}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Dismiss
        </button>
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