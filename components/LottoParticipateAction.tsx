import { useRef, useState, useEffect } from 'react';

interface StyleType {
  input: string;
  ball: string;
  bigball: string;
}

interface ContractType {
  doQuery: (method: string, args: number[][]) => void;
  dryRun: (method: string, args: number[][]) => Promise<{ success: boolean }>;
  doTx: (method: string, args: number[][]) => void;
}

interface NumbersType {
  sn: number[];
  ssn: (numbers: number[]) => void;
}

interface Props {
  contract: ContractType;
  numbers: NumbersType;
}

const style: StyleType = {
  input: `text-center w-8 m-2 border border-sky-500`,
  ball: `w-[2.5rem] h-[2.5rem] pt-[6px] m-1 text-center border-1 rounded-full cursor-pointer`,
  bigball: `w-20 h-20 pt-[0px] text-2xl m-1 text-center border-1 rounded-full bg-gray-600`
};

const LottoParticipateAction: React.FC<Props> = (props) => {
  const [canParticipate, setCanParticipate] = useState<boolean>(false);
  const selected_numbers = props.numbers.sn;
  
  const refLottoNb1 = useRef<HTMLInputElement>(null);
  const refLottoNb2 = useRef<HTMLInputElement>(null);
  const refLottoNb3 = useRef<HTMLInputElement>(null);
  const refLottoNb4 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("useEffect triggered", selected_numbers);
    const checkDryRun = async () => {
      if (selected_numbers.length === 4) {
        const dryRunRes = await props.contract.dryRun("participate", [selected_numbers]);
        console.log("dryRunRes", dryRunRes);
        setCanParticipate(dryRunRes.success);
      } else {
        setCanParticipate(false);
      }
    };

    checkDryRun();
  }, [props.numbers.sn, props.contract, selected_numbers]);

  const processNumber = (e: number, ele: React.MouseEvent<HTMLDivElement>) => {
    let newNumbers = [...selected_numbers];

    if (newNumbers.includes(e)) {
      const e_index = newNumbers.indexOf(e);
      newNumbers.splice(e_index, 1);
      (ele.target as HTMLDivElement).className = style.ball + " border-transparent ";
    } else {
      if (newNumbers.length < 4) {
        newNumbers.push(e);
        (ele.target as HTMLDivElement).className = style.ball + " bg-gradient-to-br from-purple-500 to-pink-500 border-pink-600";
      }
    }
    
    newNumbers = newNumbers.sort((a, b) => a - b);
    props.numbers.ssn(newNumbers);

    if (refLottoNb1.current) refLottoNb1.current.value = newNumbers[0] ? newNumbers[0].toString() : "";
    if (refLottoNb2.current) refLottoNb2.current.value = newNumbers[1] ? newNumbers[1].toString() : "";
    if (refLottoNb3.current) refLottoNb3.current.value = newNumbers[2] ? newNumbers[2].toString() : "";
    if (refLottoNb4.current) refLottoNb4.current.value = newNumbers[3] ? newNumbers[3].toString() : "";
  };

  const checkLottoNumbers = (): boolean => {
    if (!refLottoNb1.current || !refLottoNb2.current || !refLottoNb3.current || !refLottoNb4.current) return false;

    const numbersOk = 
      (Number(refLottoNb1.current.value) > 0
        && Number(refLottoNb2.current.value) > 0
        && Number(refLottoNb3.current.value) > 0
        && Number(refLottoNb4.current.value) > 0)
      && (Number(refLottoNb1.current.value) <= 50
        && Number(refLottoNb2.current.value) <= 50
        && Number(refLottoNb3.current.value) <= 50
        && Number(refLottoNb4.current.value) <= 50)
      && (refLottoNb1.current.value 
        !== refLottoNb2.current.value)
      && (refLottoNb1.current.value  
        !== refLottoNb3.current.value)
      && (refLottoNb1.current.value  
        !== refLottoNb4.current.value)
      && (refLottoNb2.current.value 
        !== refLottoNb3.current.value)
      && (refLottoNb2.current.value 
        !== refLottoNb4.current.value)
      && (refLottoNb3.current.value 
        !== refLottoNb4.current.value);

    return numbersOk;
  };

  const doDryRun = async(): Promise<void> => {
    const dryRunRes = await props.contract.dryRun("participate", [selected_numbers]);
    console.log("dryRunRes", dryRunRes);
  };

  const numbers: number[] = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className='w-100'>
      <div className="w-96 flex flex-wrap m-auto">
        {numbers.map(e => (
          <div 
            key={e} 
            onClick={(ele) => processNumber(e, ele)} 
            className={style.ball + " border-transparent"}
          >
            {e}
          </div>
        ))}
      </div>
      <div className='w-96 m-auto flex place-content-around'>
        <input disabled ref={refLottoNb1} className={style.bigball} id="refLottoNb1" />
        <input disabled ref={refLottoNb2} className={style.bigball} id="refLottoNb2" />
        <input disabled ref={refLottoNb3} className={style.bigball} id="refLottoNb3" />
        <input disabled ref={refLottoNb4} className={style.bigball} id="refLottoNb4" />
      </div>
      <div 
        className="w-60 m-auto cursor-pointer" 
        onClick={() => canParticipate && props.contract.doTx("participate", [selected_numbers])}
      >
        <button 
          disabled={!canParticipate}
          className={`px-14 m-auto py-2 mt-8 mx-4 ${canParticipate ? 'bg-gray-600' : 'bg-gray-400'} border-1 border-gray-900 text-gray-100 font-bold rounded-lg`}
        >
          Participate!
        </button>
      </div>
    </div>
  );
};

export default LottoParticipateAction;
