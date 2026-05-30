'use client'

import { useBlockBreaker } from '@/hooks/useBlockBreaker'
import { useLocalScore } from '@/hooks/useLocalScore'
import { useScoreContract } from '@/hooks/useScoreContract'
import { useUser } from '@/hooks/useUser'
import { useWallet } from '@/contexts/WalletContext'
import WalletConnect from './WalletConnect'
import SplashScreen from './SplashScreen'
import Leaderboard from './Leaderboard'
import { useState } from 'react'
import Image from 'next/image'

export default function BlockBreakerGame() {
    const { canvasRef, gameState, startGame, pauseGame, resetGame } = useBlockBreaker()
    const { saveLocalScore } = useLocalScore()
    const { saveScore, isPending, isConfirming, isSuccess } = useScoreContract()
    const { isConnected } = useWallet()
    const { user } = useUser()
    const [showSplash, setShowSplash] = useState(true)
    const [showMenu, setShowMenu] = useState(false)

    const handleStartFromSplash = () => {
        setShowSplash(false)
        setShowMenu(true)
    }

    const handleStartGame = () => {
        setShowMenu(false)
        startGame()
    }

    const handleSaveScore = () => {
        if (isConnected) {
            // Save to blockchain
            saveScore(gameState.score, gameState.level)
            // Also save locally as backup
            saveLocalScore(gameState.score, gameState.level)
        } else {
            alert('Please connect your wallet to save your score on Base blockchain!')
        }
    }

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onStart={handleStartFromSplash} />
    }

    if (showMenu) {
        return (
            <div className="game-container">
                <div className="menu-screen">
                    <h1 className="menu-title">🎮 Block Breaker</h1>
                    <p>Break all the blocks to win!</p>
                    <p>Control: 🖱️ Mouse / Touch / ⌨️ Arrow Keys</p>

                    <div className="menu-buttons">
                        <button className="game-button" onClick={handleStartGame}>
                            ▶️ Start Game
                        </button>
                    </div>

                    <Leaderboard />

                    <WalletConnect />
                </div>
            </div>
        )
    }

    if (gameState.isGameOver) {
        return (
            <div className="game-container">
                <div className="menu-screen">
                    <h2 className="menu-title">Game Over!</h2>
                    <div className="score-display">
                        Final Score: {gameState.score}
                    </div>
                    <div className="score-display">
                        Level Reached: {gameState.level}
                    </div>

                    <div className="menu-buttons">
                        {!isConnected ? (
                            <>
                                <p style={{ color: '#00d9ff', marginBottom: '15px' }}>
                                    Connect wallet to save your score on-chain
                                </p>
                                <WalletConnect />
                            </>
                        ) : (
                            <button
                                className="game-button"
                                onClick={handleSaveScore}
                                disabled={isPending || isConfirming}
                            >
                                {isPending || isConfirming ? '⏳ Saving...' : '💾 Save Score on Base'}
                            </button>
                        )}

                        <button className="game-button" onClick={handleStartGame}>
                            🔄 Play Again
                        </button>

                        <button className="game-button" onClick={() => {
                            resetGame()
                            setShowMenu(true)
                        }}>
                            🏠 Main Menu
                        </button>
                    </div>

                    {isSuccess && (
                        <p className="wallet-info">✅ Score saved on Base blockchain!</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="game-container">
            <div className="game-ui">
                <div className="score-display">
                    Score: {gameState.score}
                </div>
                <div className="score-display">
                    Lives: {'❤️'.repeat(gameState.lives)}
                </div>
                <div className="score-display">
                    Level: {gameState.level}
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="game-canvas"
            />

            <div className="game-ui">
                <button className="game-button" onClick={pauseGame}>
                    {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
                <button className="game-button" onClick={() => {
                    resetGame()
                    setShowMenu(true)
                }}>
                    🏠 Menu
                </button>
            </div>

            {user && (
                <div className="wallet-info" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    {user.pfpUrl && (
                        <Image
                            src={user.pfpUrl}
                            alt={user.displayName}
                            width={24}
                            height={24}
                            style={{ borderRadius: '50%' }}
                        />
                    )}
                    <span>@{user.username}</span>
                </div>
            )}

            <div className="power-up-legend">
                <p style={{ fontSize: '12px', opacity: 0.7 }}>
                    Power-ups: ⚽ Extra Ball | ↔️ Expand | ↕️ Shrink | ⚡ Speed Up | 🐌 Slow Down | ❤️ Extra Life
                </p>
            </div>
        </div>
    )
}
