'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'

export default function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connectors, connect } = useConnect()
    const { disconnect } = useDisconnect()
    const [showOptions, setShowOptions] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    if (isConnected && address) {
        return (
            <div className="wallet-info">
                <p>Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
                <button className="game-button" onClick={() => disconnect()}>
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div className="wallet-connect">
            <button
                className="game-button"
                onClick={() => setShowOptions(!showOptions)}
            >
                🔗 Sign Wallet
            </button>

            {showOptions && (
                <div className="connector-options" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {connectors.map((connector) => (
                        <button
                            key={connector.uid}
                            className="game-button"
                            style={{ fontSize: '14px', padding: '8px 16px' }}
                            onClick={() => {
                                connect({ connector })
                                setShowOptions(false)
                            }}
                        >
                            {connector.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
