import { useQuery, gql } from '@apollo/client';
import { useWeb3 } from '../contexts/Web3Context';

const GET_FILTER_VALUES = gql`
  query GetFilterValues {
    drawNumbers: participations(orderBy: DRAW_NUMBER_DESC) {
      nodes {
        drawNumber
        __typename
      }
      __typename
    }
    chains: participations {
      nodes {
        chain
        __typename
      }
      __typename
    }
  }
`;

interface FilterNode {
  __typename: string;
}

interface DrawNumberNode extends FilterNode {
  drawNumber: string;
}

interface ChainNode extends FilterNode {
  chain: string;
}

interface QueryResponse {
  drawNumbers: {
    nodes: DrawNumberNode[];
    __typename: string;
  };
  chains: {
    nodes: ChainNode[];
    __typename: string;
  };
}

interface FilterValues {
  drawNumbers: string[];
  chains: string[];
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
    data?.drawNumbers?.nodes?.map((node: DrawNumberNode) => node.drawNumber) || []
  )).sort((a, b) => parseInt(b) - parseInt(a));

  const chains = Array.from(new Set(
    data?.chains?.nodes?.map((node: ChainNode) => node.chain) || []
  )).sort();

  return {
    drawNumbers,
    chains,
    isLoading: loading,
    error: error ? error as Error : null,
    refetch
  };
}; 