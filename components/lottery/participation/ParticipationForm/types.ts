import { LotteryContract } from '../../results/types';

export interface ParticipationFormProps {
  contract: LotteryContract;
}

export interface NumberSelectorProps {
  selectedNumbers: number[];
  onNumberSelect: (number: number) => void;
  maxSelections: number;
}

export interface SubmitButtonProps {
  canParticipate: boolean;
  onParticipate: () => void;
  isLoading?: boolean;
} 