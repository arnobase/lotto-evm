import { useQuery, gql } from '@apollo/client';
import { useWeb3 } from '../contexts/Web3Context';
import { useEffect } from 'react';

export interface DrawResult {
  drawNumber: string;
  numbers: number[];
}

interface QueryResponse {
  results: {
    nodes: DrawResult[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    totalCount: number;
  };
}

const GET_DRAW_RESULTS = gql`
  query GetDrawResults($after: Cursor) {
    results(orderBy: DRAW_NUMBER_DESC, first: 100, after: $after) {
      nodes {
        drawNumber
        numbers
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const useLotteryResults = () => {
  const { evmNetwork } = useWeb3();

  const { data, loading, error, fetchMore, refetch } = useQuery<QueryResponse>(GET_DRAW_RESULTS, {
    skip: !evmNetwork,
    fetchPolicy: 'network-only',
    variables: { after: null }
  });

  const loadMore = async () => {
    if (data?.results.pageInfo.hasNextPage) {
      try {
        await fetchMore({
          variables: {
            after: data.results.pageInfo.endCursor
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              results: {
                nodes: [
                  ...prev.results.nodes,
                  ...fetchMoreResult.results.nodes
                ],
                pageInfo: fetchMoreResult.results.pageInfo,
                totalCount: fetchMoreResult.results.totalCount
              }
            };
          }
        });
        console.log(`Loaded page with cursor ${data.results.pageInfo.endCursor}, total results: ${data.results.nodes.length}/${data.results.totalCount}`);
      } catch (error) {
        console.error('Error loading more results:', error);
      }
    }
  };

  // Charger automatiquement toutes les pages
  const loadAllPages = async () => {
    if (!data?.results.totalCount) return;
    
    const totalPages = Math.ceil(data.results.totalCount / 100);
    console.log(`Starting to load all pages. Total count: ${data.results.totalCount}, Pages needed: ${totalPages}`);
    
    let currentPage = 1;
    while (data?.results.pageInfo.hasNextPage && currentPage < totalPages) {
      console.log(`Loading page ${currentPage + 1}/${totalPages}`);
      await loadMore();
      currentPage++;
    }
  };

  // Charger toutes les pages au montage du composant
  useEffect(() => {
    if (data?.results.pageInfo.hasNextPage && data?.results.totalCount > data.results.nodes.length) {
      console.log('Starting initial load of all pages');
      loadAllPages();
    }
  }, [data?.results.pageInfo.hasNextPage, data?.results.totalCount]);

  return {
    drawResults: data?.results.nodes || [],
    isLoading: loading || (data?.results.totalCount || 0) > (data?.results.nodes.length || 0),
    error: error ? `Erreur lors du chargement des résultats: ${error.message}` : null,
    refreshResults: () => {
      // Recharger la première page
      refetch().then(() => {
        // Puis charger toutes les pages suivantes
        loadAllPages();
      });
    },
    totalResults: data?.results.totalCount || 0,
    loadedResults: data?.results.nodes.length || 0
  };
}; 