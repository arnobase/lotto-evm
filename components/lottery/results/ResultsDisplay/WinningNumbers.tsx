import { WinningNumbersProps } from '../types';
import NumberBall from '../../../common/NumberBall';

const WinningNumbers: React.FC<WinningNumbersProps> = ({ numbers, timestamp }) => {
  const date = new Date(timestamp * 1000);
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(date);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        Tirage du {formattedDate}
      </h3>
      <div className="flex justify-center gap-4">
        {numbers.map((number, index) => (
          <NumberBall
            key={`${timestamp}-${index}`}
            number={number}
            selected={true}
            onClick={() => {}}
            size="md"
          />
        ))}
      </div>
    </div>
  );
};

export default WinningNumbers; 