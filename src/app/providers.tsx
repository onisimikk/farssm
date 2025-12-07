'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import sdk from '@farcaster/miniapp-sdk'
import { config } from '@/app/config/wagmi'

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())
    const [isMiniKitReady, setIsMiniKitReady] = useState(false)

    useEffect(() => {
        const initMiniKit = async () => {
            try {
                await sdk.actions.ready()
                setIsMiniKitReady(true)
                console.log('MiniKit SDK initialized')
            } catch (error) {
                console.error('MiniKit initialization failed:', error)
            }
        }

        initMiniKit()
    }, [])

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
