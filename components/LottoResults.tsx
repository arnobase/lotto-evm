import { useLottoResultsData } from '../hooks/useLottoResultsData';
import { useLottoWinnersData } from '../hooks/useLottoWinnersData';

interface LottoResult {
  
  drawNumber: number;
  numbers: string;

}

interface LottoWinner {

  drawNumber: number;
  accountId: string;

}

const LottoResults = () => {

  const { data: resultsData, loading: resultsLoading, error: resultsError } = useLottoResultsData();
  const { data: winnersData, loading: winnersLoading, error: winnersError } = useLottoWinnersData();

  if (resultsLoading || winnersLoading) return <div>Loading...</div>;
  if (resultsError || winnersError) {
    console.error('Results Error:', resultsError);
    console.error('Winners Error:', winnersError);
    return <div>Error loading data</div>;
  }

  return (
    <>
      <div className='pt-4 pb-6 w-100 bg-[#191B1F] mt-6 p rounded-2xl'>
        <div className='m-auto w-64'>
          <h3 className='text-xl py-3'>📜 Results of all lotto draws</h3>  
          <table>
            <thead>
              <tr><td>Raffle</td><td>Numbers</td></tr>
            </thead>
            <tbody>
              {resultsData?.results?.nodes.map((e: LottoResult) => (
                <tr key={e.drawNumber}>
                  <td className='w-20 text-center'>{e.drawNumber}</td>
                  <td className='w-40'>{String(e.numbers)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='pt-4 pb-6 w-100 bg-[#191B1F] mt-6 p rounded-2xl'>
        <div className='m-auto w-64'>
          <h3 className='text-xl py-3'>🏆 Winners list</h3>
          <table>
            <thead>
              <tr><td>Raffle</td><td>Account</td></tr>
            </thead>
            <tbody>
              {winnersData?.winners?.nodes.map((e: LottoWinner) => (
                <tr key={e.drawNumber}>
                  <td className='w-20 text-center'>{e.drawNumber}</td>
                  <td className='w-40'>{e.accountId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default LottoResults; 