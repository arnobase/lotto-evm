export const formatAddress = (address: string, type: 'substrate' | 'evm' = 'evm'): string => {
  if (!address) return '';
  
  // Si l'adresse est déjà au format souhaité, la retourner telle quelle
  if (type === 'evm' && address.startsWith('0x')) return address;
  if (type === 'substrate' && !address.startsWith('0x')) return address;

  // Conversion EVM vers Substrate
  if (type === 'substrate' && address.startsWith('0x')) {
    return `5${address.slice(2)}`;
  }

  // Conversion Substrate vers EVM
  if (type === 'evm' && !address.startsWith('0x')) {
    return `0x${address.slice(1)}`;
  }

  return address;
}; 