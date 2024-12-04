export interface LotteryResult {
  numbers: number[];
  timestamp?: number;
  transactionHash: string;
  hash: string;
  drawNumber: string;
  chain: string;
  accountId: string;
}

export interface ResultsDisplayProps {
  results: LotteryResult[];
  isLoading?: boolean;
}

export interface WinningNumbersProps {
  numbers: number[];
  timestamp: number;
}

export interface TransactionHistoryProps {
  transactions: LotteryResult[];
}

export interface TransactionParams {
  method: string;
  args: number[][];
  toastId: string;
}

export interface LotteryContract {
  doQuery: (method: string, args: number[][]) => Promise<LotteryResult[]>;
  doTx: (params: TransactionParams) => Promise<{ hash: string }>;
  dryRun: (method: string, args: number[][]) => Promise<{ success: boolean }>;
} 