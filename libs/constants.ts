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
  addToMenu : boolean;
  menuLink? : string;
  info: EVMNetworkInfo | SubstrateNetworkInfo;
}

// Define your networks
export const NETWORKS: Network[] = [
  {
    name: 'Soneium',
    type: 'EVM',
    addToMenu : true,
    info: {
      chainId: '0x74C',
      chainName: 'Soneium',
      indexerContractId: 21,
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://rpc.soneium.org/'],
      blockExplorerUrls: ["https://soneium.blockscout.com/"]
    },
  },
  {
    name: 'Astar',
    type: 'EVM',
    addToMenu : true,
    menuLink : "https://lucky.substrate.fi/lotto/astar",
    info: {
      chainId: '0x51',  // 81 en décimal
      chainName: 'Astar Network',
      indexerContractId: 20,
      nativeCurrency: {
        name: 'Astar',
        symbol: 'ASTR',
        decimals: 18,
      },
      rpcUrls: ['https://evm.astar.network'],
      blockExplorerUrls: ["https://astar.subscan.io/"]
    },
  },
  /*
  {
    name: 'Minato',
    type: 'EVM',
    addToMenu : true,
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
    addToMenu : true,
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
  {
    name: 'Shibuya',
    type: 'EVM',
    addToMenu : true,
    menuLink : "https://lucky.substrate.fi/lotto/shibuya",
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
  },
   */
];

// Interface pour les adresses de contrat
interface ContractAddresses {
  [key: string]: string;
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  'Soneium': '0xB2196C9B95BD3cdC799eb89f856895aEDbd649bB',
  'Astar': 'ZsaaL58Adg7k1xT1EumK575H6GymJ214kvRk8NxKouTWqnC',
  /*
  'Minato': '0x04d884675E5790721cb5F24D41D460E921C08f17',
  'Moonbase': '0x987461a5eF325f9f217D2b777CeDCf3b9c4D62d5',
  'Shibuya': 'bSm4f7WjbxFMbo4fRUGw7oHvva65P8m8jCqedFsXAwUJx7V',
   */
};