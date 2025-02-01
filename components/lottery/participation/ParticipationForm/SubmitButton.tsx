import { SubmitButtonProps } from './types';

const SubmitButton: React.FC<SubmitButtonProps> = ({
  canParticipate,
  onParticipate,
  isLoading = false
}) => {
  return (
    <button
      onClick={onParticipate}
      disabled={!canParticipate || isLoading}
      className={`
        w-full px-6 py-3 mt-6
        rounded-lg font-semibold
        transition-all duration-200
        ${canParticipate && !isLoading
          ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-purple-600 text-white relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500 before:via-fuchsia-500 before:to-purple-500 before:animate-gradient-x before:bg-[length:200%_100%]'
          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border border-gray-400 dark:border-gray-500 cursor-not-allowed'
        }
      `}
    >
      <span className="relative">{isLoading ? 'Participating...' : 'Participate!'}</span>
    </button>
  );
};

export default SubmitButton; 