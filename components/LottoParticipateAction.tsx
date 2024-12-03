import { useRef, useState, useEffect, useCallback } from 'react';

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

const MAX_SELECTIONS = 4;
const TOTAL_NUMBERS = 50;

const style: StyleType = {
  input: `text-center w-8 m-2 border border-sky-500`,
  ball: `w-[2.5rem] h-[2.5rem] pt-[6px] m-1 text-center border-1 rounded-full cursor-pointer`,
  bigball: `w-16 h-16 pt-[0px] text-xl m-1 text-center border-1 rounded-full bg-gray-600`
};

const LottoParticipateAction: React.FC<Props> = ({ contract, numbers: { sn: selected_numbers, ssn } }) => {
  const [canParticipate, setCanParticipate] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const refs = Array(MAX_SELECTIONS).fill(null).map(() => useRef<HTMLInputElement>(null));
  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);

  const checkDryRun = useCallback(async () => {
    if (selected_numbers.length === MAX_SELECTIONS) {
      const dryRunRes = await contract.dryRun("participate", [selected_numbers]);
      setCanParticipate(dryRunRes.success);
    } else {
      setCanParticipate(false);
    }
  }, [contract, selected_numbers]);

  useEffect(() => {
    checkDryRun();
    if (selected_numbers.length === MAX_SELECTIONS) {
      setErrorMessage("");
    }
  }, [checkDryRun, selected_numbers.length]);

  const updateInputValues = (numbers: number[]) => {
    refs.forEach((ref, index) => {
      if (ref.current) {
        ref.current.value = numbers[index]?.toString() || "";
      }
    });
  };

  const handleParticipateClick = () => {
    if (selected_numbers.length < MAX_SELECTIONS) {
      setErrorMessage(`Veuillez sélectionner 4 numéros`);
      return;
    }
    
    if (canParticipate) {
      setErrorMessage("");
      contract.doTx("participate", [selected_numbers]);
    }
  };

  const processNumber = (number: number, event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    let newNumbers = [...selected_numbers];

    if (newNumbers.includes(number)) {
      newNumbers = newNumbers.filter(n => n !== number);
      target.className = `${style.ball} border-transparent`;
    } else if (newNumbers.length < MAX_SELECTIONS) {
      newNumbers.push(number);
      target.className = `${style.ball} bg-gradient-to-br from-purple-500 to-pink-500 border-pink-600`;
    }
    
    newNumbers.sort((a, b) => a - b);
    ssn(newNumbers);
    updateInputValues(newNumbers);
  };

  const getBallClassName = (number: number) => `
    ${style.ball} 
    ${selected_numbers.includes(number) 
      ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-pink-600' 
      : 'border-transparent'}
  `;

  return (
    <div className='w-100'>
      <div className="w-[400px] grid grid-cols-8 gap-1 m-auto justify-center">
        {numbers.map(number => (
          <div 
            key={number} 
            onClick={(event) => processNumber(number, event)} 
            className={getBallClassName(number)}
          >
            {number}
          </div>
        ))}
      </div>
      
      <div className='w-96 m-auto flex place-content-around'>
        {refs.map((ref, index) => (
          <input
            key={index}
            disabled
            ref={ref}
            className={style.bigball}
            id={`refLottoNb${index + 1}`}
          />
        ))}
      </div>

      <div className="w-60 m-auto">
        <button 
          onClick={handleParticipateClick}
          className={`
            px-14 m-auto py-2 mt-8 mx-4 
            ${canParticipate ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400'} 
            border-1 border-gray-900 text-gray-100 font-bold rounded-lg
          `}
        >
          Participate!
        </button>
        
        {errorMessage && (
          <div className="text-red-500 text-center mt-2 text-sm">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default LottoParticipateAction;
