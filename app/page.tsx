"use client";

import { Toaster } from 'react-hot-toast';
import { ApolloProvider } from '@apollo/client';
import { client } from '../libs/apollo-client';
import LottoPage from "../components/lottery/LotteryPage";
import Header from "../components/Header";
import { AppProvider } from "../contexts/AppContext";
import { Web3Provider } from "../contexts/Web3Context";
import { ContractProvider } from "../contexts/ContractContext";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <AppProvider>
        <Web3Provider>
          <ContractProvider>
            <ThemeProvider>
              <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                <Toaster 
                  position="bottom-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      padding: '16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      minWidth: '300px',
                    } as React.CSSProperties,
                    className: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600',
                  }}
                />
                <Header />
                <LottoPage />
              </main>
            </ThemeProvider>
          </ContractProvider>
        </Web3Provider>
      </AppProvider>
    </ApolloProvider>
  );
}
