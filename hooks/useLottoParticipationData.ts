import { useQuery, gql } from '@apollo/client';

const PARTICIPATIONS_QUERY = gql`
  query GetParticipations {
    participations(
      orderBy: [DRAW_NUMBER_DESC, ID_DESC]
    ) {
      nodes {
        id
        chain
        registrationContractId
        drawNumber
        accountId
        numbers
      }
    }
  }
`;

const FILTERED_PARTICIPATIONS_QUERY = gql`
  query GetFilteredParticipations($registrationContractId: BigFloat!) {
    participations(
      where: { registrationContractId: { eq: $registrationContractId } }
      orderBy: [DRAW_NUMBER_DESC, ID_DESC]
    ) {
      nodes {
        id
        chain
        registrationContractId
        drawNumber
        accountId
        numbers
      }
    }
  }
`;

export function useLottoParticipationData(registrationContractId?: string) {
  const query = registrationContractId ? FILTERED_PARTICIPATIONS_QUERY : PARTICIPATIONS_QUERY;
  
  return useQuery(query, {
    variables: registrationContractId ? {
      registrationContractId: parseInt(registrationContractId)
    } : {},
    pollInterval: 5000,
  });
} 