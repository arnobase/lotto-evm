import React from 'react';

const LottoIntro: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="text-lg margin-auto text-center">
        <div className="text-2xl">The Lotto raffle</div>
        
        <div>Pick 4 numbers and submit your participation (free to play).</div>
        <div>A draw is made every Tuesday</div>
        <div>If your numbers match the draw, you win!</div>
        <div>If there is no winner, the jackpot is put back into play </div>
      </div>
    </div>
  );
};

export default LottoIntro;
