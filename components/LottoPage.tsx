import { useEffect, useState, useRef } from 'react';
import LottoParticipationList from './LottoParticipationList';
import LottoParticipateAction from './LottoParticipateAction';
import LottoResults from './LottoResults';
//import LottoHeader from './LottoHeader';
import LottoIntro from "./LottoIntro";
//import LottoFooter from "./LottoFooter";
import { useContract } from '../contexts/ContractContext';

export default function LottoPage() {
  const { doQuery, doTx, dryRun } = useContract();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("participate"); // Initialize with a default value

  const tabs = []
  tabs.push(useRef<HTMLDivElement>(null)) // Specify the type here
  tabs.push(useRef<HTMLDivElement>(null)) // Specify the type here


  useEffect(() => {
    const tab_hash = window.location.hash !== "" ? window.location.hash.substring(1) : "participate";
    setSelectedTab(tab_hash);
  }, []);

  return (
    <div>
      <div className={`flex items-center justify-center mt-14`}>
        <div className="md:w-[600px] content-block bg-[#191B1F] rounded-2xl px-2 py-8">
          <LottoIntro/>
        </div>
      </div>
      <div className={`flex items-center justify-center mt-14`}>
        <div className="md:w-[600px] content-block bg-[#191B1F] rounded-2xl px-8 py-8">
          {/*<LottoHeader/>*/}
          <ul className="mb-8 text-sm font-medium text-center rounded-lg shadow flex divide-gray-700 text-gray-400">
            <li className="w-full focus-within:z-10">
              <a href="#participate" key="1" id="lotto-tab-participate" onClick={()=>{setSelectedTab("participate")}} className={(selectedTab==="participate"?"bg-slate-600 ":"")+"inline-block w-full p-4 border-r border-gray-500 dark:border-gray-700 rounded-s-lg active focus:outline-none bg-gray-700 text-white"} aria-current="page">Participate</a>
            </li>
            <li className="w-full focus-within:z-10">
              <a href="#results" key="2" id="lotto-tab-results" onClick={()=>{setSelectedTab("results")}} className={(selectedTab==="results"?"bg-slate-600 ":"")+"inline-block w-full p-4 dark:border-gray-700 rounded-e-lg focus:outline-none bg-gray-700 text-white"}>Results</a>
            </li>
          </ul>
          <div id="lotto-participate" ref={tabs[0]} className={selectedTab==="participate"?"":"hidden"}>
            <LottoParticipateAction contract={{doQuery, doTx, dryRun}} numbers={{sn:selectedNumbers,ssn:setSelectedNumbers}} />
            <LottoParticipationList/>
          </div>
          <div id="lotto-results" ref={tabs[1]} className={selectedTab==="results"?"":"hidden"}>
            <LottoResults/>
          </div>
        </div>
      </div>
      <div className={`flex items-center justify-center mt-14`}>
        <div className="md:w-[800px]  rounded-2xl px-2 py-8 mb-8">
          {/*<LottoFooter/>*/}
        </div>
      </div>
    </div>
  );
}





