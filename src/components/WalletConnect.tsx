'use client'

import { useState, useEffect } from 'react'
import sdk from '@farcaster/miniapp-sdk'
import { useUser } from '@/hooks/useUser'
import { useWallet } from '@/contexts/WalletContext'
import Image from 'next/image'

export default function WalletConnect() {
    const { user } = useUser()
    const { walletAddress, setWalletAddress } = useWallet()
    const [isConnecting, setIsConnecting] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleConnect = async () => {
        try {
            setIsConnecting(true)

            // Get wallet address from SDK
            const context = await sdk.context

            if (context?.user) {
                // Request wallet access
                const accounts = await sdk.wallet.ethProvider.request({
                    method: 'eth_accounts' as any,
                }) as string[]

                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0])
                } else {
                    // Request account access
                    const newAccounts = await sdk.wallet.ethProvider.request({
                        method: 'eth_requestAccounts' as any,
                    }) as string[]

                    if (newAccounts && newAccounts.length > 0) {
                        setWalletAddress(newAccounts[0])
                    }
                }
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error)
            alert('Failed to connect wallet. Please try again.')
        } finally {
            setIsConnecting(false)
        }
    }

    const handleDisconnect = () => {
        setWalletAddress(null)
    }

    if (!mounted) return null

    if (walletAddress) {
        return (
            <div className="wallet-info">
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
                        {user.pfpUrl && (
                            <Image
                                src={user.pfpUrl}
                                alt={user.displayName}
                                width={32}
                                height={32}
                                style={{ borderRadius: '50%' }}
                            />
                        )}
                        <span>@{user.username}</span>
                    </div>
                )}
                <p>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                <button className="game-button" onClick={handleDisconnect}>
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div className="wallet-connect">
            <button
                className="game-button"
                onClick={handleConnect}
                disabled={isConnecting}
            >
                {isConnecting ? '⏳ Connecting...' : '🔗 Connect Wallet'}
            </button>
        </div>
    )
}
