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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  #{result.drawNumber}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Latest Draw
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {result.numbers.map((number, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg"
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