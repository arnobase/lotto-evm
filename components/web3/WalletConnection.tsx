import React from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { formatAddress } from '../../utils/format';

const WalletConnection: React.FC = () => {
  const { 
    evmAccount, 
    evmConnectWallet, 
    evmDisconnectWallet,
    isConnecting,
    error 
  } = useWeb3();

  return (
    <div className="relative">
      {evmAccount ? (
        <button
          onClick={evmDisconnectWallet}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            bg-gray-100 dark:bg-gray-700 
            text-gray-700 dark:text-gray-300 
            hover:bg-gray-200 dark:hover:bg-gray-600 
            hover:text-gray-900 dark:hover:text-white 
            transition-all duration-200
            border border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>{formatAddress(evmAccount.address)}</span>
          </div>
          <svg
            className="w-5 h-5 stroke-current"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 16L21 12M21 12L17 8M21 12H9M9 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={evmConnectWallet}
          disabled={isConnecting}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
            transition-all duration-200
            ${isConnecting 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span>Connect Wallet</span>
              <svg
                className="w-5 h-5 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12H13M13 12L17 16M13 12L17 8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 8V16M3 12H9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      )}
      
      {error && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 text-sm rounded-lg border border-red-200 dark:border-red-800 shadow-lg">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
