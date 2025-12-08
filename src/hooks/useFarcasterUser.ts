'use client'

import { useEffect, useState } from 'react'
import sdk from '@farcaster/miniapp-sdk'

export interface FarcasterUser {
    fid: number
    username: string
    displayName: string
    pfpUrl: string
}

export function useFarcasterUser() {
    const [user, setUser] = useState<FarcasterUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            try {
                // Get user context - it's a promise
                const context = await sdk.context

                if (context?.user) {
                    setUser({
                        fid: context.user.fid,
                        username: context.user.username || `fid:${context.user.fid}`,
                        displayName: context.user.displayName || context.user.username || `User ${context.user.fid}`,
                        pfpUrl: context.user.pfpUrl || '',
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
