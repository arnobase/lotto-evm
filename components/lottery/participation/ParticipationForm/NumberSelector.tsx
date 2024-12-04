import { NumberSelectorProps } from './types';
import NumberBall from '../../../common/NumberBall';

const TOTAL_NUMBERS = 50;

const NumberSelector: React.FC<NumberSelectorProps> = ({
  selectedNumbers,
  onNumberSelect,
  maxSelections
}) => {
  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);

  const handleNumberClick = (number: number) => {
    onNumberSelect(number);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-8 gap-2 justify-center">
        {numbers.map(number => (
          <NumberBall
            key={number}
            number={number}
            selected={selectedNumbers.includes(number)}
            onClick={handleNumberClick}
            size="md"
          />
        ))}
      </div>
      <div className="text-center mt-4 text-gray-400">
        Select {maxSelections} numbers ({selectedNumbers.length} selected)
      </div>
    </div>
  );
};

export default NumberSelector; 