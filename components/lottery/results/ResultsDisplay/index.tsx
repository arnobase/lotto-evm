import { DrawResult } from '../../../../hooks/useLotteryResults';

interface ResultsDisplayProps {
  results: DrawResult[];
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading results...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No results available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div key={result.drawNumber} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Draw #{result.drawNumber}
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {result.numbers.map((number, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold"
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsDisplay; 