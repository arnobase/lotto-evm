import { ReactNode } from "react";
import { Web3Provider } from "./Web3Context";
import { ContractProvider } from "./ContractContext";
import { ApolloProvider } from '@apollo/client';
import { client } from '../libs/apollo-client';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ApolloProvider client={client}>
      <Web3Provider>
        <ContractProvider>
          {children}
        </ContractProvider>
      </Web3Provider>
    </ApolloProvider>
  );
}
