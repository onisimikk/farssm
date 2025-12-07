'use client'

import { useState, useEffect } from 'react'
import { HighScore } from '@/types/game'

const STORAGE_KEY = 'blockbreaker_highscores'
const MAX_SCORES = 10

export function useLocalScore() {
    const [localScores, setLocalScores] = useState<HighScore[]>([])

    // Load scores from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                try {
                    const scores = JSON.parse(saved)
                    setLocalScores(scores)
                } catch (e) {
                    console.error('Failed to parse saved scores:', e)
                }
            }
        }
    }, [])

    // Save score to localStorage
    const saveLocalScore = (score: number, level: number) => {
        const newScore: HighScore = {
            address: 'Guest',
            score,
            level,
            timestamp: Date.now(),
        }

        const updatedScores = [...localScores, newScore]
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SCORES)

        setLocalScores(updatedScores)

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores))
        }

        return updatedScores
    }

    return {
        localScores,
        saveLocalScore,
    }
}
