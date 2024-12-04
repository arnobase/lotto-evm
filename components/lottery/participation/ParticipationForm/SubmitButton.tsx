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
          ? 'bg-gradient-to-r from-green-500 via-cyan-400 to-green-500 hover:from-green-600 hover:via-cyan-500 hover:to-green-600 text-white relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500 before:via-cyan-400 before:to-green-500 before:animate-gradient-x before:bg-[length:200%_100%]'
          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }
      `}
    >
      <span className="relative">{isLoading ? 'Participating...' : 'Participate!'}</span>
    </button>
  );
};

export default SubmitButton; 