import React from 'react';
import NumberBall from '../../../common/NumberBall';

interface LastParticipationProps {
  numbers: number[];
}

const LastParticipation: React.FC<LastParticipationProps> = ({ numbers }) => {
  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-emerald-600 dark:text-emerald-400">
        Last Participation
      </h3>
      <div className="flex gap-2 flex-wrap">
        {numbers.map((number, index) => (
          <NumberBall
            key={index}
            number={number}
            selected={true}
            size="sm"
            onClick={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default LastParticipation; 