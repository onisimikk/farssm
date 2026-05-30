import { describe, expect, it } from 'vitest'

import {
    BASE_BLOCK_EXPLORER_URL,
    BASE_CHAIN_ID,
    BASE_CHAIN_ID_HEX,
    BASE_MAINNET_CHAIN,
    BASE_RPC_URL,
    SCOREBOARD_CONTRACT_ADDRESS,
    isBaseMainnetChain,
} from './base'
import { config } from './wagmi'

describe('Base mainnet config', () => {
    it('uses Base mainnet chain 8453 across app config', () => {
        expect(BASE_CHAIN_ID).toBe(8453)
        expect(BASE_CHAIN_ID_HEX).toBe('0x2105')
        expect(BASE_MAINNET_CHAIN.id).toBe(8453)
        expect(isBaseMainnetChain(8453)).toBe(true)
        expect(isBaseMainnetChain(84532)).toBe(false)
    })

    it('configures wagmi for Base mainnet only', () => {
        expect(config.chains.map((chain) => chain.id)).toEqual([8453])
    })

    it('keeps public Base endpoints and contract address centralized', () => {
        expect(BASE_RPC_URL).toBe('https://mainnet.base.org')
        expect(BASE_BLOCK_EXPLORER_URL).toBe('https://base.blockscout.com')
        expect(SCOREBOARD_CONTRACT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
})
