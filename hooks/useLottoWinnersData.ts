import { useQuery, gql } from '@apollo/client';

const LOTTO_WINNERS_QUERY = gql`
  query GetLottoWinners {
    winners(
      orderBy: [DRAW_NUMBER_DESC, ID_DESC],
    ) {
      nodes {
        drawNumber
        accountId
      }
    }
  }
`;

export function useLottoWinnersData() {
  return useQuery(LOTTO_WINNERS_QUERY, {
    pollInterval: 5000,
  });
} 