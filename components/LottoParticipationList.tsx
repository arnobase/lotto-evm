import { useWeb3 } from '../contexts/Web3Context';
import { useLottoParticipationData } from '../hooks/useLottoParticipationData';
import { NETWORKS } from '../libs/constants';
import { useState, useEffect } from 'react';

interface LottoParticipation {
  id: string;
  chain: string;
  registrationContractId: string;
  drawNumber: string;
  accountId: string;
  numbers: string[];
}

  // Fonction pour formater l'adresse
  const formatAccountAddress = (address: string) => {
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  // Fonction pour obtenir le nom du réseau à partir de l'indexerContractId
  const getNetworkName = (registrationContractId: string) => {
    const network = NETWORKS.find(net => 
      net.info.indexerContractId.toString() === registrationContractId
    );
    return network?.name || 'Unknown';
  };

const LottoParticipationList: React.FC = () => {
  const { evmNetwork } = useWeb3();
  const network = NETWORKS.find(net => net.name === evmNetwork && net.type === 'EVM');
  
  const [raffleFilter, setRaffleFilter] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('');

  const { data, loading, error, refetch } = useLottoParticipationData(
    //network?.info?.indexerContractId?.toString() || ''
    undefined
  );

  useEffect(() => {
    refetch();
  }, [refetch,raffleFilter, accountFilter]);

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error('Participations Error:', error);
    return <div>Error loading data</div>;
  }

  return (
    <div className='pt-4 pb-6 w-5/6 m-auto bg-[#191B1F] mt-6 p rounded-2xl'>
      <div className='m-auto w-5/6'>
        <h3 className='text-xl py-3'>🎫 Participations</h3>
        <input
          className="bg-[#191B1F] ring-grey focus:ring-[rgba(116,190,100,1)] focus:border-[rgba(116,190,100,1)] text-white px-2 py-1 mb-3 w-full rounded-lg"
          type="text"
          placeholder="Filter by Draw Number"
          value={raffleFilter}
          onChange={(e) => setRaffleFilter(e.target.value)}
        />
        <input
          className="bg-[#191B1F] ring-grey focus:ring-[rgba(116,190,100,1)] focus:border-[rgba(116,190,100,1)] text-white px-2 py-1 mb-3 w-full rounded-lg"
          type="text"
          placeholder="Filter by Account"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <td>Draw</td>
              <td>Account</td>
              <td>Network</td>
              <td>Numbers</td>
            </tr>
          </thead>
          <tbody className='overflow-y-scroll max-h-[400px]'>
            {data?.participations?.nodes
              .filter((p: LottoParticipation) => 
                (!raffleFilter || p.drawNumber.includes(raffleFilter)) &&
                (!accountFilter || p.accountId.toLowerCase().includes(accountFilter.toLowerCase()))
              )
              .map((participation: LottoParticipation) => (
                <tr key={participation.id}>
                  <td className='w-20 text-center'>{participation.drawNumber}</td>
                  <td className='w-40'>{formatAccountAddress(participation.accountId)}</td>
                  <td className='w-32'>{getNetworkName(participation.registrationContractId)}</td>
                  <td className='w-40'>{participation.numbers.join(', ')}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LottoParticipationList; 