import { useQuery, gql } from '@apollo/client';
import { useWeb3 } from '../contexts/Web3Context';

export interface DrawResult {
  drawNumber: string;
  numbers: number[];
}

interface QueryResponse {
  results: {
    nodes: DrawResult[];
  };
}

const GET_DRAW_RESULTS = gql`
  query GetDrawResults {
    results(orderBy: DRAW_NUMBER_DESC) {
      nodes {
        drawNumber
        numbers
      }
    }
  }
`;

export const useLotteryResults = () => {
  const { evmNetwork } = useWeb3();

  const { data, loading, error, refetch } = useQuery<QueryResponse>(GET_DRAW_RESULTS, {
    skip: !evmNetwork,
    fetchPolicy: 'network-only'
  });

  return {
    drawResults: data?.results.nodes || [],
    isLoading: loading,
    error: error ? `Erreur lors du chargement des résultats: ${error.message}` : null,
    refreshResults: refetch
  };
}; 