# Bmad v.6 - Block Breaker Game on Farcaster Frame + Base Mainnet

Complete implementation guide for Block Breaker game with Farcaster Frame integration, Base mainnet deployment, and MiniKit wallet connection.

---

## 🎮 Project Overview

**Block Breaker** - Classic brick breaker game with blockchain score saving:
- ✅ Play without wallet connection (guest mode)
- ✅ Save high scores on Base mainnet via wallet signature
- ✅ Farcaster Frame integration
- ✅ MiniKit wallet connection
- ✅ Canvas-based game rendering

---

## 📋 Project Requirements

- Next.js 14+ with App Router
- TypeScript
- Canvas API for game rendering
- Deployed on Vercel
- Smart contract on Base mainnet (chainId: 8453)
- MiniKit SDK for wallet connection

---

## 📁 Project Structure

```
blockbreaker/
├── public/
│   ├── .well-known/
│   │   └── farcaster.json          # Farcaster manifest
│   ├── assets/
│   │   ├── ball.png                # Game ball sprite
│   │   ├── paddle.png              # Paddle sprite
│   │   ├── block-blue.png          # Blue block
│   │   ├── block-red.png           # Red block
│   │   ├── block-green.png         # Green block
│   │   ├── block-yellow.png        # Yellow block
│   │   └── background.png          # Game background
│   ├── icon.png                    # 1024x1024 app icon
│   └── splash.png                  # 1200x630 splash image
│
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   └── wagmi.ts            # Wagmi config for Base
│   │   ├── layout.tsx              # Root layout with Frame metadata
│   │   ├── providers.tsx           # Providers (Wagmi + MiniKit)
│   │   ├── page.tsx                # Game page
│   │   └── globals.css             # Global styles
│   │
│   ├── components/
│   │   ├── BlockBreakerGame.tsx    # Main game component
│   │   ├── GameCanvas.tsx          # Canvas rendering
│   │   ├── GameMenu.tsx            # Main menu
│   │   ├── GameOver.tsx            # Game over screen
│   │   ├── Leaderboard.tsx         # Top scores display
│   │   └── WalletConnect.tsx       # MiniKit wallet connection
│   │
│   ├── hooks/
│   │   ├── useBlockBreaker.ts      # Game logic hook
│   │   ├── useScoreContract.ts     # Smart contract for scores
│   │   └── useLocalScore.ts        # localStorage for guest mode
│   │
│   ├── contracts/
│   │   └── ScoreBoardABI.ts        # ScoreBoard contract ABI
│   │
│   └── types/
│       └── game.ts                 # Game type definitions
│
├── .gitignore
├── package.json
├── next.config.js
└── tsconfig.json
```

---

## 🚀 Step 1: Install Dependencies

```bash
npm install wagmi viem @tanstack/react-query
npm install @farcaster/miniapp-sdk
npm install next react react-dom typescript
npm install @types/node @types/react @types/react-dom -D
```

### package.json:

```json
{
  "name": "blockbreaker-base",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "wagmi": "^2.12.0",
    "viem": "^2.21.0",
    "@tanstack/react-query": "^5.56.0",
    "@farcaster/miniapp-sdk": "^0.1.30"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}
```

---

## 📱 Step 2: Farcaster Frame Configuration

### File: `public/.well-known/farcaster.json`

```json
{
  "accountAssociation": {
    "header": "BASE64_ENCODED_HEADER_FROM_WARPCAST",
    "payload": "BASE64_ENCODED_PAYLOAD_FROM_WARPCAST",
    "signature": "SIGNATURE_FROM_WARPCAST"
  },
  "miniapp": {
    "version": "1",
    "name": "Block Breaker",
    "subtitle": "Classic brick breaking game on Base",
    "description": "Play the classic block breaker game and save your high scores on Base blockchain. No wallet required to play!",
    "screenshotUrls": ["https://yourapp.vercel.app/splash.png"],
    "iconUrl": "https://yourapp.vercel.app/icon.png",
    "splashImageUrl": "https://yourapp.vercel.app/splash.png",
    "splashBackgroundColor": "#1a1a2e",
    "homeUrl": "https://yourapp.vercel.app",
    "webhookUrl": "https://yourapp.vercel.app/api/frame",
    "primaryCategory": "games",
    "tags": ["game", "arcade", "blockchain", "base"],
    "heroImageUrl": "https://yourapp.vercel.app/splash.png",
    "tagline": "Break blocks, save scores on-chain",
    "ogTitle": "Block Breaker - Play & Earn",
    "ogDescription": "Classic arcade game with blockchain score persistence",
    "ogImageUrl": "https://yourapp.vercel.app/splash.png"
  },
  "baseBuilder": {
    "ownerAddress": "0xYOUR_WALLET_ADDRESS_FROM_BASE_BUILD"
  }
}
```

**How to get accountAssociation:**
1. Go to https://warpcast.com/~/developers/frames
2. Create frame with your URL
3. Copy `header`, `payload`, `signature`

---

## ⚙️ Step 3: Wagmi Configuration for Base Mainnet

### File: `src/app/config/wagmi.ts`

```typescript
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: 'Block Breaker',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: true,
})

// Base mainnet configuration
export const BASE_CHAIN_ID = 8453
export const BASE_RPC_URL = 'https://mainnet.base.org'
export const BASE_EXPLORER = 'https://basescan.org'
```

---

## 🔌 Step 4: Providers Setup with MiniKit SDK

### File: `src/app/providers.tsx`

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import sdk from '@farcaster/miniapp-sdk'
import { config } from '@/app/config/wagmi'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [isMiniKitReady, setIsMiniKitReady] = useState(false)

  useEffect(() => {
    const initMiniKit = async () => {
      try {
        await sdk.actions.ready()
        setIsMiniKitReady(true)
        console.log('MiniKit SDK initialized')
      } catch (error) {
        console.error('MiniKit initialization failed:', error)
      }
    }

    initMiniKit()
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

---

## 📄 Step 5: Layout with Frame Metadata

### File: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.vercel.app'

export const metadata: Metadata = {
  title: "Block Breaker - Play on Base",
  description: "Classic brick breaker game with blockchain score saving on Base",
  openGraph: {
    title: "Block Breaker - Play on Base",
    description: "Classic arcade game with blockchain score persistence",
    images: [{
      url: `${APP_URL}/splash.png`,
      width: 1200,
      height: 630,
      alt: "Block Breaker Game",
    }],
  },
  other: {
    "fc:frame": "vNext",
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${APP_URL}/splash.png`,
      button: {
        title: "🎮 Play Now",
        action: {
          type: "launch_miniapp",
          name: "Block Breaker",
          url: APP_URL
        }
      }
    }),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

---

## 🎨 Step 6: Global Styles

### File: `src/app/globals.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  min-height: 100vh;
  overflow: hidden;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.game-canvas {
  border: 3px solid #0f3460;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  background: #000;
}

.game-ui {
  margin-top: 20px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.score-display {
  font-size: 24px;
  font-weight: bold;
  background: rgba(15, 52, 96, 0.8);
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #0f3460;
}

.game-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #e94560 0%, #533483 100%);
  color: white;
}

.game-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(233, 69, 96, 0.4);
}

.game-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-screen {
  text-align: center;
  max-width: 500px;
}

.menu-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #e94560 0%, #533483 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.leaderboard {
  background: rgba(15, 52, 96, 0.6);
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  margin: 20px auto;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.wallet-info {
  font-size: 14px;
  color: #00d9ff;
  margin: 10px 0;
}
```

---

## 🎮 Step 7: Game Type Definitions

### File: `src/types/game.ts`

```typescript
export interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
  speed: number
}

export interface Paddle {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

export interface Block {
  x: number
  y: number
  width: number
  height: number
  color: string
  visible: boolean
  points: number
}

export interface GameState {
  score: number
  lives: number
  level: number
  isPlaying: boolean
  isGameOver: boolean
  isPaused: boolean
}

export interface HighScore {
  address: string
  score: number
  timestamp: number
  level: number
}
```

---

## 🎯 Step 8: Game Logic Hook

### File: `src/hooks/useBlockBreaker.ts`

```typescript
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Ball, Paddle, Block, GameState } from '@/types/game'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 120
const PADDLE_HEIGHT = 15
const BALL_RADIUS = 8
const BLOCK_ROWS = 5
const BLOCK_COLS = 10
const BLOCK_WIDTH = 75
const BLOCK_HEIGHT = 20
const BLOCK_PADDING = 5

export function useBlockBreaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    isPlaying: false,
    isGameOver: false,
    isPaused: false,
  })

  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    dx: 3,
    dy: -3,
    radius: BALL_RADIUS,
    speed: 1,
  })

  const [paddle, setPaddle] = useState<Paddle>({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8,
  })

  const [blocks, setBlocks] = useState<Block[]>([])

  // Initialize blocks
  const initializeBlocks = useCallback(() => {
    const newBlocks: Block[] = []
    const colors = ['#e94560', '#0f3460', '#00d9ff', '#ffb400', '#7f5af0']

    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < BLOCK_COLS; col++) {
        newBlocks.push({
          x: col * (BLOCK_WIDTH + BLOCK_PADDING) + 35,
          y: row * (BLOCK_HEIGHT + BLOCK_PADDING) + 80,
          width: BLOCK_WIDTH,
          height: BLOCK_HEIGHT,
          color: colors[row % colors.length],
          visible: true,
          points: (BLOCK_ROWS - row) * 10,
        })
      }
    }
    setBlocks(newBlocks)
  }, [])

  // Mouse movement for paddle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !gameState.isPlaying) return

      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left

      setPaddle(prev => ({
        ...prev,
        x: Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2))
      }))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [gameState.isPlaying])

  // Touch movement for mobile
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!canvasRef.current || !gameState.isPlaying) return
      e.preventDefault()

      const rect = canvasRef.current.getBoundingClientRect()
      const touchX = e.touches[0].clientX - rect.left

      setPaddle(prev => ({
        ...prev,
        x: Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, touchX - PADDLE_WIDTH / 2))
      }))
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
      return () => canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameState.isPlaying])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!canvasRef.current || gameState.isPaused) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw blocks
    blocks.forEach(block => {
      if (block.visible) {
        ctx.fillStyle = block.color
        ctx.fillRect(block.x, block.y, block.width, block.height)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.strokeRect(block.x, block.y, block.width, block.height)
      }
    })

    // Draw paddle
    ctx.fillStyle = '#00d9ff'
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
    ctx.shadowBlur = 10
    ctx.shadowColor = '#00d9ff'

    // Draw ball
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#e94560'
    ctx.fill()
    ctx.shadowBlur = 15
    ctx.shadowColor = '#e94560'
    ctx.closePath()

    // Update ball position
    setBall(prev => {
      let newX = prev.x + prev.dx
      let newY = prev.y + prev.dy
      let newDx = prev.dx
      let newDy = prev.dy

      // Wall collision
      if (newX + prev.radius > CANVAS_WIDTH || newX - prev.radius < 0) {
        newDx = -prev.dx
      }
      if (newY - prev.radius < 0) {
        newDy = -prev.dy
      }

      // Paddle collision
      if (
        newY + prev.radius > paddle.y &&
        newY - prev.radius < paddle.y + paddle.height &&
        newX > paddle.x &&
        newX < paddle.x + paddle.width
      ) {
        newDy = -Math.abs(prev.dy)
        // Add angle based on where ball hits paddle
        const hitPos = (newX - paddle.x) / paddle.width - 0.5
        newDx = prev.dx + hitPos * 2
      }

      // Block collision
      setBlocks(prevBlocks => {
        let scored = false
        const newBlocks = prevBlocks.map(block => {
          if (
            block.visible &&
            newX + prev.radius > block.x &&
            newX - prev.radius < block.x + block.width &&
            newY + prev.radius > block.y &&
            newY - prev.radius < block.y + block.height
          ) {
            scored = true
            newDy = -newDy
            setGameState(prev => ({ ...prev, score: prev.score + block.points }))
            return { ...block, visible: false }
          }
          return block
        })
        return newBlocks
      })

      // Ball fell off screen
      if (newY + prev.radius > CANVAS_HEIGHT) {
        setGameState(prev => {
          const newLives = prev.lives - 1
          if (newLives <= 0) {
            return { ...prev, lives: 0, isPlaying: false, isGameOver: true }
          }
          return { ...prev, lives: newLives }
        })

        // Reset ball
        return {
          ...prev,
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT - 40,
          dx: 3,
          dy: -3,
        }
      }

      return {
        ...prev,
        x: newX,
        y: newY,
        dx: newDx,
        dy: newDy,
      }
    })

    // Check if level complete
    const visibleBlocks = blocks.filter(b => b.visible).length
    if (visibleBlocks === 0) {
      setGameState(prev => ({ ...prev, level: prev.level + 1, isPaused: true }))
      setTimeout(() => {
        initializeBlocks()
        setBall(prev => ({ ...prev, speed: prev.speed + 0.5 }))
        setGameState(prev => ({ ...prev, isPaused: false }))
      }, 2000)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [ball, paddle, blocks, gameState.isPaused, initializeBlocks])

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState.isPlaying, gameState.isPaused, gameLoop])

  const startGame = () => {
    initializeBlocks()
    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      isPlaying: true,
      isGameOver: false,
      isPaused: false,
    })
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 40,
      dx: 3,
      dy: -3,
      radius: BALL_RADIUS,
      speed: 1,
    })
  }

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  const resetGame = () => {
    setGameState({
      score: 0,
      lives: 3,
      level: 1,
      isPlaying: false,
      isGameOver: false,
      isPaused: false,
    })
  }

  return {
    canvasRef,
    gameState,
    startGame,
    pauseGame,
    resetGame,
  }
}
```

---

## 💾 Step 9: Local Score Storage Hook

### File: `src/hooks/useLocalScore.ts`

```typescript
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
```

---

## 🔗 Step 10: Smart Contract Hook for Score Saving

### File: `src/contracts/ScoreBoardABI.ts`

```typescript
export const ScoreBoardABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'score', type: 'uint256' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
    ],
    name: 'saveScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerScore',
    outputs: [
      { internalType: 'uint256', name: 'score', type: 'uint256' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTopScores',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'player', type: 'address' },
          { internalType: 'uint256', name: 'score', type: 'uint256' },
          { internalType: 'uint256', name: 'level', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct ScoreBoard.Score[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
```

### File: `src/hooks/useScoreContract.ts`

```typescript
'use client'

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { ScoreBoardABI } from '@/contracts/ScoreBoardABI'

// Hardcoded contract address on Base mainnet
// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = '0xYourScoreBoardContractAddress' as `0x${string}`

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
```

---

## 👛 Step 11: Wallet Connection Component (MiniKit)

### File: `src/components/WalletConnect.tsx`

```typescript
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [showOptions, setShowOptions] = useState(false)

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
        <div className="connector-options">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              className="game-button"
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
```

---

## 🎮 Step 12: Main Game Component

### File: `src/components/BlockBreakerGame.tsx`

```typescript
'use client'

import { useBlockBreaker } from '@/hooks/useBlockBreaker'
import { useLocalScore } from '@/hooks/useLocalScore'
import { useScoreContract } from '@/hooks/useScoreContract'
import { useAccount } from 'wagmi'
import WalletConnect from './WalletConnect'
import { useState } from 'react'

export default function BlockBreakerGame() {
  const { canvasRef, gameState, startGame, pauseGame, resetGame } = useBlockBreaker()
  const { localScores, saveLocalScore } = useLocalScore()
  const { saveScore, isPending, isConfirming, isSuccess } = useScoreContract()
  const { isConnected, address } = useAccount()
  const [showMenu, setShowMenu] = useState(true)

  const handleStartGame = () => {
    setShowMenu(false)
    startGame()
  }

  const handleSaveScore = () => {
    // Save locally first
    saveLocalScore(gameState.score, gameState.level)

    // Save to blockchain if connected
    if (isConnected) {
      saveScore(gameState.score, gameState.level)
    } else {
      alert('Connect your wallet to save score on Base blockchain!')
    }
  }

  if (showMenu) {
    return (
      <div className="game-container">
        <div className="menu-screen">
          <h1 className="menu-title">🎮 Block Breaker</h1>
          <p>Break all the blocks to win!</p>
          <p>Use mouse or touch to move the paddle</p>

          <div className="menu-buttons">
            <button className="game-button" onClick={handleStartGame}>
              ▶️ Start Game
            </button>

            {localScores.length > 0 && (
              <div className="leaderboard">
                <h3>🏆 High Scores</h3>
                {localScores.slice(0, 5).map((score, index) => (
                  <div key={index} className="leaderboard-entry">
                    <span>#{index + 1}</span>
                    <span>{score.address === 'Guest' ? '👤 Guest' : `${score.address.slice(0, 6)}...${score.address.slice(-4)}`}</span>
                    <span>{score.score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <button
              className="game-button"
              onClick={handleSaveScore}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? '⏳ Saving...' : '💾 Save Score'}
            </button>

            {!isConnected && (
              <WalletConnect />
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

      {isConnected && address && (
        <div className="wallet-info">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}
    </div>
  )
}
```

---

## 📱 Step 13: Main Page

### File: `src/app/page.tsx`

```typescript
'use client'

import { Providers } from './providers'
import BlockBreakerGame from '@/components/BlockBreakerGame'

export default function Home() {
  return (
    <Providers>
      <main>
        <BlockBreakerGame />
      </main>
    </Providers>
  )
}
```

---

## 🚀 Step 14: Deployment

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Build locally first
npm run build

# Deploy to production
npx vercel --prod
```

### Critical Vercel Settings:

1. **Disable Deployment Protection:**
   - Project Settings → Deployment Protection → Disable
   - Makes `/.well-known/farcaster.json` publicly accessible

2. **Environment Variables** (Optional):
   ```env
   NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
   ```

---

## 🎨 Step 15: Create Game Assets

You need to create/add these images to `public/assets/`:

### Required Images:

1. **ball.png** (32x32px)
   - Red/pink glowing circle

2. **paddle.png** (120x15px)
   - Cyan/blue rectangular bar

3. **block-blue.png** (75x20px)
4. **block-red.png** (75x20px)
5. **block-green.png** (75x20px)
6. **block-yellow.png** (75x20px)
7. **block-purple.png** (75x20px)
   - Colored rectangular blocks with borders

8. **background.png** (800x600px)
   - Dark gradient or space theme

### App Icons:

9. **public/icon.png** (1024x1024px)
   - App icon for Farcaster

10. **public/splash.png** (1200x630px)
    - Splash screen with game title and preview

---

## 🔐 Step 16: Smart Contract Deployment

### Sample Solidity Contract: `ScoreBoard.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScoreBoard {
    struct Score {
        address player;
        uint256 score;
        uint256 level;
        uint256 timestamp;
    }

    mapping(address => Score) public playerScores;
    Score[] public topScores;
    uint256 public constant MAX_TOP_SCORES = 10;

    event ScoreSaved(address indexed player, uint256 score, uint256 level);

    function saveScore(uint256 _score, uint256 _level) external {
        require(_score > 0, "Score must be greater than 0");

        // Update player's score if it's better
        if (_score > playerScores[msg.sender].score) {
            playerScores[msg.sender] = Score({
                player: msg.sender,
                score: _score,
                level: _level,
                timestamp: block.timestamp
            });

            updateTopScores(msg.sender, _score, _level);
            emit ScoreSaved(msg.sender, _score, _level);
        }
    }

    function updateTopScores(address _player, uint256 _score, uint256 _level) internal {
        // Remove old entry if exists
        for (uint256 i = 0; i < topScores.length; i++) {
            if (topScores[i].player == _player) {
                topScores[i] = topScores[topScores.length - 1];
                topScores.pop();
                break;
            }
        }

        // Add new score
        topScores.push(Score({
            player: _player,
            score: _score,
            level: _level,
            timestamp: block.timestamp
        }));

        // Sort top scores (bubble sort - ok for small arrays)
        for (uint256 i = 0; i < topScores.length; i++) {
            for (uint256 j = i + 1; j < topScores.length; j++) {
                if (topScores[i].score < topScores[j].score) {
                    Score memory temp = topScores[i];
                    topScores[i] = topScores[j];
                    topScores[j] = temp;
                }
            }
        }

        // Keep only top scores
        while (topScores.length > MAX_TOP_SCORES) {
            topScores.pop();
        }
    }

    function getPlayerScore(address _player) external view returns (uint256, uint256, uint256) {
        Score memory playerScore = playerScores[_player];
        return (playerScore.score, playerScore.level, playerScore.timestamp);
    }

    function getTopScores() external view returns (Score[] memory) {
        return topScores;
    }
}
```

### Deploy using Remix or Hardhat:

```bash
# Using Hardhat
npx hardhat run scripts/deploy.ts --network base

# Or use Remix IDE at https://remix.ethereum.org
# Connect to Base mainnet via MetaMask
# Deploy the contract
# Copy contract address to src/hooks/useScoreContract.ts
```

---

## ✅ Step 17: Final Checklist

Before submission to Base Build:

- ✅ `farcaster.json` accessible at `/.well-known/farcaster.json`
- ✅ Account association from Warpcast
- ✅ `baseBuilder.ownerAddress` matches your wallet
- ✅ Guest mode works (play without wallet)
- ✅ Wallet connection only required for saving scores
- ✅ Contract deployed on Base mainnet
- ✅ Contract address hardcoded in `useScoreContract.ts`
- ✅ Game playable on mobile and desktop
- ✅ All images optimized and loaded
- ✅ RPC endpoint set to `https://mainnet.base.org`

### Test:

```bash
# Verify farcaster.json
curl https://yourapp.vercel.app/.well-known/farcaster.json | jq .

# Test in Warpcast
# Share link in a post to see frame preview

# Test game locally
npm run dev
```

---

## 📝 Step 18: Submit to Base Build

1. Go to https://build.base.org
2. Sign in with wallet (same as `baseBuilder.ownerAddress`)
3. Click "Import your mini app"
4. Enter URL: `https://yourapp.vercel.app`
5. System validates `farcaster.json`
6. Fill submission form:
   - **Name:** Block Breaker
   - **Tagline:** Break blocks, save scores on-chain
   - **Description:** Classic arcade brick breaker game with blockchain score persistence on Base network
   - **Category:** Games
   - **Tags:** arcade, game, blockchain

---

## 🎯 Key Features Summary

1. **Guest Mode** ✅
   - Play without wallet connection
   - Scores saved in localStorage
   - No authentication required to start

2. **Wallet Integration** ✅
   - MiniKit SDK for wallet connection
   - Sign transaction to save score on-chain
   - Optional - only when user wants to persist

3. **Game Mechanics** ✅
   - Canvas-based rendering
   - Mouse and touch controls
   - Progressive difficulty (levels)
   - Lives system
   - Score tracking

4. **Blockchain Integration** ✅
   - Smart contract on Base mainnet
   - Save high scores on-chain
   - Leaderboard from blockchain
   - Wagmi + Viem for contract interaction

5. **Farcaster Frame** ✅
   - Proper manifest configuration
   - Frame metadata in layout
   - Launch button in Warpcast
   - Account association verified

---

## 🔧 Troubleshooting

### Issue: Canvas not rendering
**Solution:** Check canvas ref and ensure game loop is running

### Issue: Wallet connection fails
**Solution:** Ensure MiniKit SDK is initialized in providers

### Issue: Contract writes fail
**Solution:** Verify contract address and network (Base mainnet chainId: 8453)

### Issue: Frame not showing in Warpcast
**Solution:** Check `fc:miniapp` metadata in layout.tsx and account association

### Issue: Deployment protection error
**Solution:** Disable Vercel Deployment Protection for public access

---

## 📚 Reference Links

- Base Documentation: https://docs.base.org
- MiniKit Quickstart: https://docs.base.org/mini-apps/quickstart/create-new-miniapp
- Wagmi Docs: https://wagmi.sh
- Farcaster Frames: https://miniapps.farcaster.xyz/docs/specification
- Base Build: https://build.base.org
- Warpcast Developers: https://warpcast.com/~/developers/frames

---

## 🎮 Next Steps

1. Clone or create project structure
2. Install dependencies
3. Copy all code files
4. Create/add game assets
5. Deploy smart contract to Base
6. Update contract address
7. Deploy to Vercel
8. Get Farcaster account association
9. Submit to Base Build
10. Share and play!

---

**Game is now ready to deploy! 🚀**

Break blocks, earn points, save scores on Base blockchain!
