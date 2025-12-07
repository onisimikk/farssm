import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
    chains: [base],
    connectors: [
        injected({ shimDisconnect: true }),
        coinbaseWallet({
            appName: 'Block Breaker',
            preference: 'smartWalletOnly',
        }),
    ],
    transports: {
        [base.id]: http('https://mainnet.base.org'),
    },
    ssr: true,
})

// Base mainnet configuration
export const BASE_CHAIN_ID = 8453
export const BASE_RPC_URL = 'https://mainnet.base.org'
export const BASE_EXPLORER = 'https://basescan.org'
