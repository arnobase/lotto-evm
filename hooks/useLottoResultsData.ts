import { useQuery, gql } from '@apollo/client';
import { print } from 'graphql';

const LOTTO_RESULTS_QUERY = gql`
  query GetLottoResults {
    results(
      orderBy: [DRAW_NUMBER_DESC, ID_DESC],
    ) {
      nodes {
        drawNumber
        numbers
      }
    }
  }
`;

export function useLottoResultsData() {
  console.log('Query:', print(LOTTO_RESULTS_QUERY));

  return useQuery(LOTTO_RESULTS_QUERY, {
    pollInterval: 5000,
  });
} 