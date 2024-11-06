// Define the types of networks
type NetworkType = 'EVM' | 'Substrate';

// Define the structure for EVM network information
interface EVMNetworkInfo {
  chainId: string;
  chainName: string;
  indexerContractId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[] | null;
}

// Define the structure for Substrate network information
interface SubstrateNetworkInfo {
  // Add relevant fields for Substrate networks
  chainId: string;
  chainName: string;
  indexerContractId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[] | null;
}

// Define a type that can be either EVM or Substrate
interface Network {
  name: string;
  type: NetworkType;
  info: EVMNetworkInfo | SubstrateNetworkInfo;
}

// Define your networks
export const NETWORKS: Network[] = [
  {
    name: 'Minato',
    type: 'EVM',
    info: {
      chainId: '0x79a',
      chainName: 'Minato',
      indexerContractId: 11,
      nativeCurrency: {
        name: 'Minato ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.minato.soneium.org/'],
      blockExplorerUrls: ["https://explorer-testnet.soneium.org/"]
    },
  },
  {
    name: 'Moonbase',
    type: 'EVM',
    info: {
      chainId: '0x507',  // 1287 en décimal
      chainName: 'Moonbase Alpha',
      indexerContractId: 12,
      nativeCurrency: {
        name: 'DEV',
        symbol: 'DEV',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
      blockExplorerUrls: ["https://moonbase.moonscan.io/"]
    },
  },
  /*{
    name: 'Shibuya',
    type: 'EVM',
    info: {
      chainId: '0x51',  // 81 en décimal
      chainName: 'Shibuya Network',
      indexerContractId: 10,
      nativeCurrency: {
        name: 'Shibuya',
        symbol: 'SBY',
        decimals: 18,
      },
      rpcUrls: ['https://evm.shibuya.astar.network'],
      blockExplorerUrls: ["https://shibuya.subscan.io/"]
    },
  },*/
];

// Interface pour les adresses de contrat
interface ContractAddresses {
  [key: string]: string;
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  'Minato': '0x474F65998C79CD63843A33c46cd6B6B00dE455AB',
  'Moonbase': '0x29621E6F2b7DBf256Ff0028dc04986C5E14Db50c',
  'Shibuya': 'ZvzNqBdnQmg2nmDnPNF9dirosinGsX53hG1Exc5xqHzJHVX',
};