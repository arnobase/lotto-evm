import React from 'react';
import clsx from 'clsx';

interface NumberBallProps {
  number: number;
  selected: boolean;
  size?: 'sm' | 'md';
  onClick?: (number: number) => void;
}

const NumberBall: React.FC<NumberBallProps> = ({
  number,
  selected,
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg'
  };

  const handleClick = () => {
    if (onClick) {
      onClick(number);
    }
  };

  return (
    <div
      className={clsx(
        'rounded-full',
        'flex items-center justify-center',
        'font-bold',
        'transition-all',
        'duration-200',
        selected 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
          : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white',
        !selected && onClick && 'hover:bg-gray-400 dark:hover:bg-gray-600',
        onClick && 'cursor-pointer',
        !onClick && 'cursor-default',
        sizeClasses[size]
      )}
      onClick={handleClick}
    >
      {number}
    </div>
  );
};

export default NumberBall; 