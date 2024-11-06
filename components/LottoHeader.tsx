import { ApiContext } from '../context/ApiProvider';
import { useContext, useEffect, useState } from 'react';
import { useLottoResultsData } from '../artifacts/useLottoResultsData';
import { useLottoWinnersData } from '../artifacts/useLottoWinnersData';
import { SS58_PREFIX } from "../artifacts/constants";
import { formatAddressShort } from "../lib/formatAddressShort";
import { LottoContractContext } from "../context/LottoContractProvider";

// Définition des interfaces pour le typage
interface ApiContextType {
  network: string;
}

interface LottoContractContextType {
  lottoContract: any; // Remplacer 'any' par le type exact du contrat si disponible
  doGetCurrentRaffleIdDryRun: () => Promise<{
    resultToHuman: {
      Ok: string;
    };
  }>;
}

const LottoHeader: React.FC = () => {
  const [raffleIdRes, setRaffleIdRes] = useState<string | undefined>();
  const { lottoContract, doGetCurrentRaffleIdDryRun } = useContext<LottoContractContextType>(LottoContractContext);
  const { network } = useContext<ApiContextType>(ApiContext);

  useEffect(() => {
    const doQuery = async () => {
      const res = await doGetCurrentRaffleIdDryRun();
      console.log("doGetCurrentRaffleIdDryRun", res.resultToHuman.Ok);
      setRaffleIdRes(res.resultToHuman.Ok);
    };

    if (lottoContract) {
      doQuery();
    }
  }, [lottoContract, doGetCurrentRaffleIdDryRun]); // Ajout de doGetCurrentRaffleIdDryRun dans les dépendances

  console.log("raffleIdRes.result", raffleIdRes);

  return (
    <>
      <div className="w-100 text-center pb-6 text-xl">
        Current Raffle: {raffleIdRes}
      </div>
    </>
  );
};

export default LottoHeader;
