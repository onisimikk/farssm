'use client'

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { ScoreBoardABI } from '@/contracts/ScoreBoardABI'

// Hardcoded contract address on Base mainnet
// Deployed: 2025-12-07 | TX: 0x951a15377c854342ed0a4aaa289a9964f5c8ef42510e819dc801c14b1e75a7b9
const CONTRACT_ADDRESS = '0xFb6647fA124D021225d52Fc74B2F927F76f3B568' as `0x${string}`

export function useScoreContract() {
    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const saveScore = (score: number, level: number) => {
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: ScoreBoardABI,
            functionName: 'saveScore',
            args: [BigInt(score), BigInt(level)],
        })
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
