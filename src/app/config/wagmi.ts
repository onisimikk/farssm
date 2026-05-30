import { http, createConfig } from 'wagmi'
import { injected, coinbaseWallet } from 'wagmi/connectors'
import { BASE_BLOCK_EXPLORER_URL, BASE_CHAIN_ID, BASE_MAINNET_CHAIN, BASE_RPC_URL } from './base'

export const config = createConfig({
    chains: [BASE_MAINNET_CHAIN],
    connectors: [
        injected({ shimDisconnect: true }),
        coinbaseWallet({
            appName: 'Block Breaker',
            preference: 'smartWalletOnly',
        }),
    ],
    transports: {
        [BASE_MAINNET_CHAIN.id]: http(BASE_RPC_URL),
    },
    ssr: true,
})

// Base mainnet configuration
export { BASE_BLOCK_EXPLORER_URL, BASE_CHAIN_ID, BASE_RPC_URL }
