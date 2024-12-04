import { useQuery, gql } from '@apollo/client';
import { useWeb3 } from '../contexts/Web3Context';
import { LotteryResult } from '../components/lottery/results/types';

export interface Participation {
  id: string;
  drawNumber: string;
  accountId: string;
  numbers: number[];
  chain: string;
}

interface QueryResponse {
  participations: {
    nodes: Participation[];
  };
}

const GET_PARTICIPATIONS = gql`
  query GetParticipations {
    participations(orderBy: [ID_DESC]) {
      nodes {
        id
        drawNumber
        accountId
        numbers
        chain
      }
    }
  }
`;

export const useLotteryParticipations = () => {
  const { evmNetwork, evmAccount } = useWeb3();

  const { data, loading, error, refetch } = useQuery<QueryResponse>(GET_PARTICIPATIONS, {
    skip: !evmNetwork || !evmAccount,
    fetchPolicy: 'network-only'
  });

  const formattedParticipations: LotteryResult[] = (data?.participations.nodes || []).map(node => ({
    numbers: node.numbers,
    transactionHash: node.id,
    hash: node.id,
    drawNumber: node.drawNumber,
    chain: node.chain,
    accountId: node.accountId
  }));

  return {
    participations: formattedParticipations,
    isLoading: loading,
    error: error ? `Error loading participations: ${error.message}` : null,
    refreshParticipations: refetch
  };
}; 