
export interface KeyInfo {
  type: string;
  value: string;
  isAddress: boolean;
  address?: string; // Actual address string, same as value if isAddress is true
  balance?: string; // e.g., "0.00000000 BTC"
  loadingBalance?: boolean;
  errorBalance?: string | null;
}

// Blockstream API response structure for address info
export interface BlockstreamAddressInfo {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}
