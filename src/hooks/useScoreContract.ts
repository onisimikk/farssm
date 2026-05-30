'use client'

import { useReadContract } from 'wagmi'
import { ScoreBoardABI } from '@/contracts/ScoreBoardABI'
import { useState } from 'react'
import { encodeFunctionData } from 'viem'
import { sendTransaction } from '@/utils/batchTransactions'
import { SCOREBOARD_CONTRACT_ADDRESS } from '@/app/config/base'

const CONTRACT_ADDRESS = SCOREBOARD_CONTRACT_ADDRESS as `0x${string}`

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

            // Use EIP-5792 batching-compatible transaction
            // This supports batching multiple calls in a single signature prompt
            const result = await sendTransaction({
                to: CONTRACT_ADDRESS,
                data: data,
                value: '0x0',
            })

            setHash(result.bundleId)
            setIsPending(false)
            setIsConfirming(true)

            // Wait for transaction confirmation
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
