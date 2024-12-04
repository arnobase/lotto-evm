import React from 'react';
import NumberBall from '../../../common/NumberBall';

interface LastParticipationProps {
  numbers: number[];
}

const LastParticipation: React.FC<LastParticipationProps> = ({ numbers }) => {
  return (
    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-emerald-400">
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