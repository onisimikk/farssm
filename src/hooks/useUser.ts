'use client'

import { useEffect, useState } from 'react'
import sdk from '@farcaster/miniapp-sdk'

export interface User {
    fid: number
    username: string
    displayName: string
    pfpUrl: string
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            try {
                // Get user context from MiniApp SDK
                const context = await sdk.context

                if (context?.user) {
                    setUser({
                        fid: context.user.fid,
                        username: context.user.username || `user:${context.user.fid}`,
                        displayName: context.user.displayName || context.user.username || `User ${context.user.fid}`,
                        pfpUrl: context.user.pfpUrl || '',
                    })
                }
            } catch (error) {
                console.error('Failed to load user profile:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadUser()
    }, [])

    return { user, isLoading }
}
