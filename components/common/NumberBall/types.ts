export interface NumberBallProps {
  number: number;
  selected: boolean;
  onClick: (number: number) => void;
  size?: 'sm' | 'md' | 'lg';
} 