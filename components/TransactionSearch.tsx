import React, { useState } from 'react';
import useDecodeTransaction from '../hooks/useDecodeTransaction';

interface InputData {
  type: string;
  name: string;
  value: string[] | string | number | boolean;
}

interface DecodedData {
  name: string;
  inputs: InputData[];
}

const TransactionSearch = () => {
  const [txHash, setTxHash] = useState<string>('');
  const [searchTriggered, setSearchTriggered] = useState<boolean>(false);
  const { decodedData, loading, error } = useDecodeTransaction(searchTriggered ? txHash : '');

  const handleSearch = () => {
    if (txHash) {
      setSearchTriggered(true);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={txHash}
        onChange={(e) => setTxHash(e.target.value)}
        placeholder="Entrez le hash de la transaction"
      />
      <button onClick={handleSearch}>Rechercher</button>

      {loading && <p>Chargement...</p>}
      {error && <p>Erreur: {error}</p>}
      {decodedData && (
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
      )}
    </div>
  );
};

export default TransactionSearch; 