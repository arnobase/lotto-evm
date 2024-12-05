import { useQuery, gql, useApolloClient } from '@apollo/client';
import { LotteryResult } from '../components/lottery/results/types';
import { useCallback } from 'react';

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
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    totalCount: number;
  };
}

const GET_PARTICIPATIONS = gql`
  query GetParticipations($after: Cursor, $filter: ParticipationFilter) {
    participations(
      orderBy: [ID_DESC],
      first: 100,
      after: $after,
      filter: $filter
    ) {
      nodes {
        id
        drawNumber
        accountId
        numbers
        chain
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

interface UseParticipationsOptions {
  drawNumber?: string;
  chain?: string;
  accountId?: string;
}

export const useLotteryParticipations = (options: UseParticipationsOptions = {}) => {
  const { drawNumber, chain, accountId } = options;
  const client = useApolloClient();

  const filterEntries = [
    drawNumber && { drawNumber: { equalTo: drawNumber } },
    chain && { chain: { equalTo: chain } },
    accountId && { accountId: { includesInsensitive: accountId } }
  ].filter(Boolean);

  const filter = filterEntries.length > 0 
    ? filterEntries.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    : { id: { isNull: false } };

  const { data, loading, error, refetch } = useQuery<QueryResponse>(GET_PARTICIPATIONS, {
    variables: {
      after: null,
      filter
    },
    fetchPolicy: 'cache-and-network'
  });

  const loadMore = useCallback(async () => {
    if (!data?.participations.pageInfo.hasNextPage) {
      console.log('No more data to load');
      return null;
    }

    try {
      console.log('Loading more with cursor:', data.participations.pageInfo.endCursor);
      const result = await client.query<QueryResponse>({
        query: GET_PARTICIPATIONS,
        variables: {
          after: data.participations.pageInfo.endCursor,
          filter
        },
        fetchPolicy: 'network-only'
      });

      // Mettre à jour le cache manuellement
      const existingData = client.readQuery<QueryResponse>({
        query: GET_PARTICIPATIONS,
        variables: { after: null, filter }
      });

      if (existingData) {
        // Dédupliquer les résultats
        const existingIds = new Set(existingData.participations.nodes.map(node => node.id));
        const newNodes = result.data.participations.nodes.filter(
          node => !existingIds.has(node.id)
        );

        const updatedData = {
          participations: {
            __typename: 'ParticipationsConnection',
            nodes: [...existingData.participations.nodes, ...newNodes],
            pageInfo: result.data.participations.pageInfo,
            totalCount: result.data.participations.totalCount
          }
        };

        console.log('Updating cache with:', {
          currentCount: existingData.participations.nodes.length,
          newNodesCount: newNodes.length,
          totalCount: result.data.participations.totalCount
        });

        client.writeQuery({
          query: GET_PARTICIPATIONS,
          variables: { after: null, filter },
          data: updatedData
        });
      }

      return result;
    } catch (error) {
      console.error('Error loading more participations:', error);
      return null;
    }
  }, [client, data, filter]);

  const refreshParticipations = useCallback(async () => {
    try {
      const result = await refetch();
      return result;
    } catch (error) {
      console.error('Error refreshing participations:', error);
      return null;
    }
  }, [refetch]);

  const getQueryVariables = useCallback(() => ({
    query: GET_PARTICIPATIONS,
    variables: {
      after: null,
      filter
    }
  }), [filter]);

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
    totalParticipations: data?.participations.totalCount || 0,
    loadedParticipations: formattedParticipations.length,
    hasNextPage: data?.participations.pageInfo.hasNextPage || false,
    loadMore,
    refreshParticipations,
    getQueryVariables
  };
}; 