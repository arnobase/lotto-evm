import { useQuery, gql } from '@apollo/client';
import { useWeb3 } from '../contexts/Web3Context';

const GET_FILTER_VALUES = gql`
  query GetFilterValues {
    raffles {
      nodes {
        drawNumber
        __typename
      }
      __typename
    }
  }
`;

interface RaffleNode {
  drawNumber: string;
  __typename: string;
}

interface QueryResponse {
  raffles: {
    nodes: RaffleNode[];
    __typename: string;
  };
}

interface FilterValues {
  drawNumbers: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useLotteryFilters = (): FilterValues => {
  const { evmNetwork } = useWeb3();

  const { data, loading, error, refetch } = useQuery<QueryResponse>(GET_FILTER_VALUES, {
    skip: !evmNetwork,
    fetchPolicy: 'network-only'
  });

  const drawNumbers = Array.from(new Set(
    data?.raffles?.nodes?.map(node => node.drawNumber) || []
  )).sort((a, b) => parseInt(b) - parseInt(a));

  return {
    drawNumbers,
    isLoading: loading,
    error: error ? error as Error : null,
    refetch
  };
}; 