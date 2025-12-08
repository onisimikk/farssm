'use client'

import { useReadContract } from 'wagmi'
import { ScoreBoardABI } from '@/contracts/ScoreBoardABI'
import { useState } from 'react'
import sdk from '@farcaster/miniapp-sdk'
import { encodeFunctionData } from 'viem'

// Hardcoded contract address on Base mainnet
// Deployed: 2025-12-07 | TX: 0x951a15377c854342ed0a4aaa289a9964f5c8ef42510e819dc801c14b1e75a7b9
const CONTRACT_ADDRESS = '0xFb6647fA124D021225d52Fc74B2F927F76f3B568' as `0x${string}`

export function useScoreContract() {
    const [isPending, setIsPending] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [hash, setHash] = useState<string | undefined>()

    const saveScore = async (score: number, level: number) => {
        try {
            setIsPending(true)

            // Encode the function call
            const data = encodeFunctionData({
                abi: ScoreBoardABI,
                functionName: 'saveScore',
                args: [BigInt(score), BigInt(level)],
            })

            // Send transaction through MiniKit's ethProvider
            const txHash = await sdk.wallet.ethProvider.request({
                method: 'eth_sendTransaction' as any,
                params: [{
                    to: CONTRACT_ADDRESS,
                    data: data,
                    value: '0x0',
                }],
            }) as string

            setHash(txHash)
            setIsPending(false)
            setIsConfirming(true)

            // Wait for transaction confirmation (simplified - in production you'd poll for receipt)
            setTimeout(() => {
                setIsConfirming(false)
                setIsSuccess(true)
            }, 5000)

        } catch (error) {
            console.error('Failed to save score:', error)
            setIsPending(false)
            setIsConfirming(false)
            alert('Failed to save score. Please try again.')
        }
    }

    return {
        saveScore,
        isPending,
        isConfirming,
        isSuccess,
        hash,
    }
}

// Read player score
export function usePlayerScore(playerAddress?: `0x${string}`) {
    const { data, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ScoreBoardABI,
        functionName: 'getPlayerScore',
        args: playerAddress ? [playerAddress] : undefined,
    })

    return { data, refetch }
}

// Read top scores
export function useTopScores() {
    const { data, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: ScoreBoardABI,
        functionName: 'getTopScores',
    })

    return { topScores: data, refetch }
}
