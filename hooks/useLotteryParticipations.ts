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
    totalCount: number;
  };
}

const GET_PARTICIPATIONS = gql`
  query GetParticipations($offset: Int!, $filter: ParticipationFilter, $first: Int!) {
    participations(
      orderBy: [TIMESTAMP_DESC]
      first: $first
      offset: $offset
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
      totalCount
    }
  }
`;

const EXPORT_PARTICIPATIONS = gql`
  query ExportParticipations($offset: Int!, $filter: ParticipationFilter, $first: Int!) {
    participations(
      orderBy: [TIMESTAMP_DESC]
      first: $first
      offset: $offset
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
      totalCount
    }
  }
`;

interface UseParticipationsOptions {
  drawNumber?: string;
  chain?: string;
  accountId?: string;
  first?: number;
  skipQuery?: boolean;
}

export const useLotteryParticipations = (options: UseParticipationsOptions = {}) => {
  const { drawNumber, chain, accountId, first = 100, skipQuery = false } = options;
  const client = useApolloClient();

  const filterEntries = [
    drawNumber && { drawNumber: { equalTo: drawNumber } },
    chain && { chain: { equalTo: chain } },
    accountId && { accountId: { equalTo: accountId } }
  ].filter(Boolean);

  const filter = filterEntries.length > 0 
    ? filterEntries.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    : undefined;

  const { data, loading, error, fetchMore } = useQuery<QueryResponse>(GET_PARTICIPATIONS, {
    variables: { 
      offset: 0,
      filter,
      first
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    skip: skipQuery
  });

  const loadMore = useCallback(async () => {
    if (!data?.participations.nodes.length) {
      return null;
    }

    try {
      const result = await fetchMore({
        variables: {
          offset: data.participations.nodes.length,
          filter,
          first
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            participations: {
              ...fetchMoreResult.participations,
              nodes: [...prev.participations.nodes, ...fetchMoreResult.participations.nodes]
            }
          };
        }
      });

      return result;
    } catch (error) {
      console.error('Error loading more participations:', error);
      return null;
    }
  }, [data, fetchMore, filter, first]);

  const refreshParticipations = useCallback(async () => {
    try {
      const result = await client.query<QueryResponse>({
        query: GET_PARTICIPATIONS,
        variables: { 
          offset: 0,
          filter,
          first
        },
        fetchPolicy: 'network-only'
      });
      return result;
    } catch (error) {
      console.error('Error refreshing participations:', error);
      return null;
    }
  }, [client, filter, first]);

  const exportAllParticipations = useCallback(async (
    onProgress?: (loaded: number, total: number) => void,
    signal?: AbortSignal
  ) => {
    try {
      const initialResult = await client.query<QueryResponse>({
        query: EXPORT_PARTICIPATIONS,
        variables: {
          offset: 0,
          first: 100,
          filter
        },
        fetchPolicy: 'no-cache',
        context: {
          fetchOptions: {
            signal
          }
        }
      });

      let allData = [...initialResult.data.participations.nodes];
      const totalCount = initialResult.data.participations.totalCount;
      let offset = 100;

      onProgress?.(allData.length, totalCount);

      while (offset < totalCount) {
        if (signal?.aborted) {
          throw new Error('Export cancelled');
        }

        const result = await client.query<QueryResponse>({
          query: EXPORT_PARTICIPATIONS,
          variables: {
            offset,
            first: 100,
            filter
          },
          fetchPolicy: 'no-cache',
          context: {
            fetchOptions: {
              signal
            }
          }
        });

        if (result.data.participations.nodes.length === 0) break;
        allData = [...allData, ...result.data.participations.nodes];
        offset += 100;

        onProgress?.(allData.length, totalCount);
      }

      return allData;
    } catch (error) {
      if (error instanceof Error && error.message === 'Export cancelled') {
        throw error;
      }
      console.error('Error exporting participations:', error);
      return [];
    }
  }, [client, filter]);

  return {
    participations: data?.participations.nodes || [],
    isLoading: loading,
    error: error ? error.message : null,
    totalParticipations: data?.participations.totalCount || 0,
    loadedParticipations: data?.participations.nodes?.length || 0,
    hasNextPage: (data?.participations.nodes?.length || 0) < (data?.participations.totalCount || 0),
    loadMore,
    refreshParticipations,
    exportAllParticipations
  };
}; 