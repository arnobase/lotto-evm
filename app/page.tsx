"use client";

import { Toaster } from 'react-hot-toast';
import { ApolloProvider } from '@apollo/client';
import { client } from '../libs/apollo-client';
import LottoPage from "../components/lottery/LotteryPage";
import Header from "../components/Header";
import { AppProvider } from "../contexts/AppContext";
import { Web3Provider } from "../contexts/Web3Context";
import { ContractProvider } from "../contexts/ContractContext";

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <AppProvider>
        <Web3Provider>
          <ContractProvider>
            <main className="min-h-screen">
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    minWidth: '300px'
                  },
                }}
              />
              <Header />
              <LottoPage />
            </main>
          </ContractProvider>
        </Web3Provider>
      </AppProvider>
    </ApolloProvider>
  );
}
