import { base } from 'wagmi/chains'

export const BASE_MAINNET_CHAIN = base
export const BASE_CHAIN_ID = base.id
export const BASE_CHAIN_ID_HEX = `0x${BASE_CHAIN_ID.toString(16)}` as const
export const BASE_RPC_URL = 'https://mainnet.base.org'
export const BASE_BLOCK_EXPLORER_URL = 'https://base.blockscout.com'
export const SCOREBOARD_CONTRACT_ADDRESS = '0xFb6647fA124D021225d52Fc74B2F927F76f3B568' as const

export function isBaseMainnetChain(chainId: number): boolean {
    return chainId === BASE_CHAIN_ID
}
