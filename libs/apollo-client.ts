import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: 'https://query.substrate.fi/lotto-multichain-subquery-mainnet',
  cache: new InMemoryCache(),
}); 