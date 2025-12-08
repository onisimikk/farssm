'use client'

import { useEffect, useState } from 'react'
import sdk from '@farcaster/miniapp-sdk'

export interface FarcasterUser {
    fid: number
    username: string
    displayName: string
    pfpUrl: string
    custody?: string
}

export function useFarcasterUser() {
    const [user, setUser] = useState<FarcasterUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            try {
                // Initialize SDK if not already
                if (!sdk.isInitialized) {
                    await sdk.init()
                }

                // Get user context
                const context = await sdk.context

                if (context?.user) {
                    setUser({
                        fid: context.user.fid,
                        username: context.user.username || `fid:${context.user.fid}`,
                        displayName: context.user.displayName || context.user.username || `User ${context.user.fid}`,
                        pfpUrl: context.user.pfpUrl || '',
                        custody: context.user.custody,
                    })
                }
            } catch (error) {
                console.error('Failed to load Farcaster user:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()
    }, [])

    return { user, isLoading }
}
