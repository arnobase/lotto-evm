import { useQuery, gql, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';

export interface Participation {
  id: string;
  drawNumber: string;
  accountId: string;
  numbers: string[];
  chain: string;
  timestamp: string;
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
  query GetParticipations($after: Cursor, $filter: ParticipationFilter, $first: Int!) {
    participations(
      orderBy: [TIMESTAMP_DESC, ID_DESC]
      first: $first
      after: $after
      filter: $filter
    ) {
      nodes {
        id
        drawNumber
        accountId
        numbers
        chain
        timestamp
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
  first?: number;
}

export const useLotteryParticipations = (options: UseParticipationsOptions = {}) => {
  const { drawNumber, chain, accountId, first = 100 } = options;
  const client = useApolloClient();

  const filterEntries = [
    drawNumber && { drawNumber: { equalTo: drawNumber } },
    chain && { chain: { equalTo: chain } },
    accountId && { accountId: { equalTo: accountId } }
  ].filter(Boolean);

  const filter = filterEntries.length > 0 
    ? filterEntries.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    : undefined;

  const { data, loading, error, refetch } = useQuery<QueryResponse>(GET_PARTICIPATIONS, {
    variables: { 
      after: null,
      filter,
      first
    },
    fetchPolicy: 'cache-and-network'
  });

  const loadMore = useCallback(async () => {
    if (!data?.participations.pageInfo.hasNextPage) {
      return null;
    }

    try {
      const result = await client.query<QueryResponse>({
        query: GET_PARTICIPATIONS,
        variables: {
          after: data.participations.pageInfo.endCursor,
          filter,
          first
        }
      });

      // Mettre à jour le cache manuellement
      const existingData = client.readQuery<QueryResponse>({
        query: GET_PARTICIPATIONS,
        variables: { after: null, filter, first }
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

        client.writeQuery({
          query: GET_PARTICIPATIONS,
          variables: { after: null, filter, first },
          data: updatedData
        });
      }

      return result;
    } catch (error) {
      console.error('Error loading more participations:', error);
      return null;
    }
  }, [client, data, filter, first]);

  const refreshParticipations = useCallback(async () => {
    try {
      return await refetch();
    } catch (error) {
      console.error('Error refreshing participations:', error);
      return null;
    }
  }, [refetch]);

  const getQueryVariables = useCallback(() => {
    return {
      query: GET_PARTICIPATIONS,
      variables: {
        after: null,
        filter,
        first
      }
    };
  }, [filter, first]);

  return {
    participations: data?.participations.nodes || [],
    isLoading: loading,
    error: error ? error.message : null,
    totalParticipations: data?.participations.totalCount || 0,
    loadedParticipations: data?.participations.nodes?.length || 0,
    hasNextPage: data?.participations.pageInfo.hasNextPage || false,
    loadMore,
    refreshParticipations,
    getQueryVariables
  };
}; 