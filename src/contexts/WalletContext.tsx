'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WalletContextType {
    walletAddress: string | null
    setWalletAddress: (address: string | null) => void
    isConnected: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null)

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                setWalletAddress,
                isConnected: !!walletAddress,
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}
