export const getExplorerUrl = (chainId: number, hash: string): string => {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return `https://etherscan.io/tx/${hash}`;
    case 137: // Polygon
      return `https://polygonscan.com/tx/${hash}`;
    case 42161: // Arbitrum
      return `https://arbiscan.io/tx/${hash}`;
    case 10: // Optimism
      return `https://optimistic.etherscan.io/tx/${hash}`;
    case 5: // Goerli
      return `https://goerli.etherscan.io/tx/${hash}`;
    case 80001: // Mumbai
      return `https://mumbai.polygonscan.com/tx/${hash}`;
    case 421613: // Arbitrum Goerli
      return `https://goerli.arbiscan.io/tx/${hash}`;
    case 420: // Optimism Goerli
      return `https://goerli-optimism.etherscan.io/tx/${hash}`;
    default:
      return '#';
  }
}; 