
import axios from 'axios';
import { BLOCKSTREAM_API_URL, SATOSHIS_PER_BTC } from '../constants';
import { BlockstreamAddressInfo } from '../types';

export async function fetchAddressBalance(address: string): Promise<string> {
  try {
    const response = await axios.get<BlockstreamAddressInfo>(`${BLOCKSTREAM_API_URL}/address/${address}`);
    const data = response.data;
    
    // Sum of confirmed and mempool stats for a more complete picture of balance
    const funded = data.chain_stats.funded_txo_sum + data.mempool_stats.funded_txo_sum;
    const spent = data.chain_stats.spent_txo_sum + data.mempool_stats.spent_txo_sum;
    
    const balanceInSatoshis = funded - spent;
    const balanceInBTC = balanceInSatoshis / SATOSHIS_PER_BTC;
    
    return `${balanceInBTC.toFixed(8)} BTC`;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      // Address not found or no transactions, effectively 0 balance from perspective of API structure
      return `0.00000000 BTC`;
    }
    console.error(`Error fetching balance for ${address}:`, error);
    // For other errors, indicate failure clearly
    if (axios.isAxiosError(error) && error.response) {
        // Handle API specific errors, e.g. rate limit, server error
        throw new Error(`API error: ${error.response.status} for ${address}`);
    }
    throw new Error(`Failed to fetch balance for ${address}`);
  }
}
