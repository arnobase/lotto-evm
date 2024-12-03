import React from 'react';
import useDecodeTransaction from '../hooks/useDecodeTransaction';

interface TransactionDetailsProps {
  txHash: string;
}

interface InputData {
  type: string;
  name: string;
  value: string[] | string | number | boolean;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ txHash }) => {
  const { decodedData, loading, error } = useDecodeTransaction(txHash);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <>
    {decodedData && (
    <div className={`flex items-center justify-center mt-8 mb-0`}>
      <div className="md:w-[600px] content-block bg-[#191B1F] rounded-2xl px-2 py-8">
          
      <div className="flex items-center justify-center">
        <div className="text-lg margin-auto text-center">
          <div>
          {decodedData.inputs
            .filter(input => input.name === "numbers")
            .map((input, index) => {
              if (Array.isArray(input.value) && input.value.every(v => typeof v === 'string')) {
                return (
                  <div key={index}>{input.name}: {(input.value as string[]).join(", ")}</div>
                );
              }
              return null;
            })}
            </div>
          </div>
        </div>
      </div>
    </div>

    )}
    </>
  );
};

export default TransactionDetails; 