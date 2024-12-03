interface TransactionResult {
  ticketId: number;
  drawId: number;
  address: string;
  numbers: number[];
}

interface Props {
  result: TransactionResult;
}

const LottoLastParticipation: React.FC<Props> = ({ result }) => {
  return (
    <div className="mt-6 p-4 bg-gray-700 rounded-lg text-white">
      <div className="flex items-center mb-3">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="text-lg font-semibold">Ticket #{result.ticketId} enregistré</h3>
      </div>
      
      <div className="mb-2">
        <div className="mb-2">Tirage #{result.drawId}</div>
        <div className="flex items-center mb-2">
          <span className="mr-2">Numéros :</span>
          <div className="flex gap-2">
            {result.numbers.map((number, index) => (
              <div 
                key={index}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold"
              >
                {number}
              </div>
            ))}
          </div>
        </div>
        <div className="text-gray-300 text-sm break-all">
          Adresse : {result.address}
        </div>
      </div>
    </div>
  );
};

export default LottoLastParticipation;
