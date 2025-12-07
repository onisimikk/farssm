'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Ball, Paddle, Block, GameState, PowerUp, PowerUpType } from '@/types/game'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 120
const PADDLE_HEIGHT = 15
const BALL_RADIUS = 8
// Layout: 10 columns * 80px space (72 width + 8 gap) = 800px
const BLOCK_COLS = 10
const BLOCK_WIDTH = 72
const BLOCK_HEIGHT = 20
const BLOCK_PADDING = 8
const COL_OFFSET = 4 // Centering

const POWERUP_SIZE = 25
const POWERUP_SPEED = 3
const INITIAL_BALL_SPEED = 6
const PADDLE_SPEED = 8
const POWERUP_DROP_CHANCE = 0.2
const POWERUP_DURATION = 10000

const POWER_UP_CONFIGS: Record<PowerUpType, { color: string; emoji: string; chance: number }> = {
    expandPaddle: { color: '#00d9ff', emoji: '↔️', chance: 0.25 },
    slowDown: { color: '#7f5af0', emoji: '🐌', chance: 0.20 },
    extraBall: { color: '#ff6b9d', emoji: '⚽', chance: 0.20 },
    extraLife: { color: '#4ecca3', emoji: '❤️', chance: 0.15 },
    shrinkPaddle: { color: '#e94560', emoji: '↕️', chance: 0.10 },
    speedUp: { color: '#ffb400', emoji: '⚡', chance: 0.10 },
}

export function useBlockBreaker() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | null>(null)
    const keysPressed = useRef<Set<string>>(new Set())
    const activePowerUpsRef = useRef<Map<PowerUpType, NodeJS.Timeout>>(new Map())

    // Game state
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        lives: 3,
        level: 1,
        isPlaying: false,
        isGameOver: false,
        isPaused: false,
    })

    const [balls, setBalls] = useState<Ball[]>([{
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 40,
        dx: INITIAL_BALL_SPEED * 0.707,
        dy: -INITIAL_BALL_SPEED * 0.707,
        radius: BALL_RADIUS,
        speed: 1,
    }])

    const [paddle, setPaddle] = useState<Paddle>({
        x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        y: CANVAS_HEIGHT - 30,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED,
    })

    const [blocks, setBlocks] = useState<Block[]>([])
    const [powerUps, setPowerUps] = useState<PowerUp[]>([])

    // References for loop
    const gameStateRef = useRef(gameState)
    const ballsRef = useRef(balls)
    const paddleRef = useRef(paddle)
    const blocksRef = useRef(blocks)
    const powerUpsRef = useRef(powerUps)

    useEffect(() => { gameStateRef.current = gameState }, [gameState])
    useEffect(() => { ballsRef.current = balls }, [balls])
    useEffect(() => { paddleRef.current = paddle }, [paddle])
    useEffect(() => { blocksRef.current = blocks }, [blocks])
    useEffect(() => { powerUpsRef.current = powerUps }, [powerUps])

    const generateLevel = useCallback((level: number) => {
        const newBlocks: Block[] = []
        const colors = ['#e94560', '#ff6b35', '#ffb400', '#4ecca3', '#00d9ff']
        const baseRows = Math.min(5 + Math.floor((level - 1) / 2), 10) // Max 10 rows

        // Level patterns
        for (let row = 0; row < baseRows; row++) {
            for (let col = 0; col < BLOCK_COLS; col++) {
                // Skip some blocks for patterns (checkerboard, etc)
                if (level % 3 === 2 && (row + col) % 2 === 0) continue; // Pattern level

                // Determine block "hardness" (health)
                let maxHealth = 1;
                let color = colors[row % colors.length];

                if (level > 2 && Math.random() < 0.2) {
                    maxHealth = 2; // Iron Block
                    color = '#94a3b8'; // Greyish
                }

                if (level > 5 && Math.random() < 0.1) {
                    maxHealth = 3; // Steel Block
                    color = '#334155'; // Dark Grey
                }

                const hasPowerUp = Math.random() < POWERUP_DROP_CHANCE

                newBlocks.push({
                    x: col * (BLOCK_WIDTH + BLOCK_PADDING) + COL_OFFSET,
                    y: row * (BLOCK_HEIGHT + BLOCK_PADDING) + 80,
                    width: BLOCK_WIDTH,
                    height: BLOCK_HEIGHT,
                    color: color,
                    visible: true,
                    points: (baseRows - row) * 10 * maxHealth,
                    hasPowerUp,
                    health: maxHealth,
                    maxHealth: maxHealth,
                })
            }
        }
        setBlocks(newBlocks)
    }, [])

    const createPowerUp = (x: number, y: number): PowerUp | null => {
        const powerUpTypes = Object.keys(POWER_UP_CONFIGS) as PowerUpType[]
        const randomValue = Math.random()
        let cumulativeChance = 0

        for (const type of powerUpTypes) {
            cumulativeChance += POWER_UP_CONFIGS[type].chance
            if (randomValue <= cumulativeChance) {
                const config = POWER_UP_CONFIGS[type]
                return {
                    x: x + BLOCK_WIDTH / 2 - POWERUP_SIZE / 2,
                    y,
                    dy: POWERUP_SPEED,
                    width: POWERUP_SIZE,
                    height: POWERUP_SIZE,
                    type,
                    color: config.color,
                    emoji: config.emoji,
                    active: true,
                }
            }
        }
        return null
    }

    const applyPowerUp = useCallback((type: PowerUpType) => {
        const existingTimeout = activePowerUpsRef.current.get(type)
        if (existingTimeout) clearTimeout(existingTimeout)

        switch (type) {
            case 'extraBall':
                setBalls(prev => {
                    if (prev.length < 5) { // Cap at 5 balls
                        const mainBall = prev[0]
                        const angle = (Math.random() * 90 - 45) * (Math.PI / 180)
                        return [...prev, {
                            ...mainBall,
                            x: mainBall.x,
                            y: mainBall.y,
                            dx: INITIAL_BALL_SPEED * Math.sin(angle),
                            dy: -INITIAL_BALL_SPEED * Math.cos(angle),
                        }]
                    }
                    return prev
                })
                break
            case 'expandPaddle':
                setPaddle(prev => ({ ...prev, width: Math.min(PADDLE_WIDTH * 1.5, 200) }))
                activePowerUpsRef.current.set('expandPaddle', setTimeout(() => {
                    setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH }))
                    activePowerUpsRef.current.delete('expandPaddle')
                }, POWERUP_DURATION))
                break
            case 'shrinkPaddle':
                setPaddle(prev => ({ ...prev, width: Math.max(PADDLE_WIDTH * 0.7, 60) }))
                activePowerUpsRef.current.set('shrinkPaddle', setTimeout(() => {
                    setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH }))
                    activePowerUpsRef.current.delete('shrinkPaddle')
                }, POWERUP_DURATION))
                break
            case 'speedUp':
                setBalls(prev => prev.map(b => ({ ...b, speed: b.speed * 1.3 })))
                activePowerUpsRef.current.set('speedUp', setTimeout(() => {
                    setBalls(prev => prev.map(b => ({ ...b, speed: 1 })))
                    activePowerUpsRef.current.delete('speedUp')
                }, POWERUP_DURATION))
                break
            case 'slowDown':
                setBalls(prev => prev.map(b => ({ ...b, speed: b.speed * 0.7 })))
                activePowerUpsRef.current.set('slowDown', setTimeout(() => {
                    setBalls(prev => prev.map(b => ({ ...b, speed: 1 })))
                    activePowerUpsRef.current.delete('slowDown')
                }, POWERUP_DURATION))
                break
            case 'extraLife':
                setGameState(prev => ({ ...prev, lives: Math.min(prev.lives + 1, 5) }))
                break
        }
    }, [])

    const updatePaddlePosition = () => {
        let move = 0
        if (keysPressed.current.has('ArrowLeft')) move -= 1
        if (keysPressed.current.has('ArrowRight')) move += 1

        if (move !== 0) {
            setPaddle(prev => ({
                ...prev,
                x: Math.max(0, Math.min(CANVAS_WIDTH - prev.width, prev.x + move * prev.speed))
            }))
        }
    }

    // Input handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowLeft', 'ArrowRight'].includes(e.key)) keysPressed.current.add(e.key)
        }
        const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key)
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!gameState.isPlaying || gameState.isPaused) return
            const canvas = canvasRef.current
            if (!canvas) return
            const rect = canvas.getBoundingClientRect()
            const scaleX = CANVAS_WIDTH / rect.width
            const mouseX = (e.clientX - rect.left) * scaleX
            setPaddle(prev => ({
                ...prev,
                x: Math.max(0, Math.min(CANVAS_WIDTH - prev.width, mouseX - prev.width / 2))
            }))
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [gameState.isPlaying, gameState.isPaused])

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (!gameState.isPlaying || gameState.isPaused) return
            e.preventDefault()
            const canvas = canvasRef.current
            if (!canvas) return
            const rect = canvas.getBoundingClientRect()
            const scaleX = CANVAS_WIDTH / rect.width
            const touchX = (e.touches[0].clientX - rect.left) * scaleX
            setPaddle(prev => ({
                ...prev,
                x: Math.max(0, Math.min(CANVAS_WIDTH - prev.width, touchX - prev.width / 2))
            }))
        }
        const canvas = canvasRef.current
        if (canvas) canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
        return () => canvas?.removeEventListener('touchmove', handleTouchMove)
    }, [gameState.isPlaying, gameState.isPaused])

    // Main Game Loop
    const gameLoop = useCallback(() => {
        if (!gameStateRef.current.isPlaying || gameStateRef.current.isPaused) {
            animationRef.current = requestAnimationFrame(gameLoop)
            return
        }

        updatePaddlePosition()
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return

        let currentBalls = [...ballsRef.current]
        let currentBlocks = [...blocksRef.current]
        let currentPowerUps = [...powerUpsRef.current]
        let currentLives = gameStateRef.current.lives
        let scoreToAdd = 0
        let levelComplete = false

        // Update Balls
        currentBalls = currentBalls.map(ball => {
            const velocityX = ball.dx * ball.speed
            const velocityY = ball.dy * ball.speed
            let nextX = ball.x + velocityX
            let nextY = ball.y + velocityY
            let nextDx = ball.dx
            let nextDy = ball.dy

            // Wall Collision
            if (nextX + ball.radius > CANVAS_WIDTH) { nextX = CANVAS_WIDTH - ball.radius; nextDx = -Math.abs(nextDx) }
            else if (nextX - ball.radius < 0) { nextX = ball.radius; nextDx = Math.abs(nextDx) }
            if (nextY - ball.radius < 0) { nextY = ball.radius; nextDy = Math.abs(nextDy) }
            else if (nextY - ball.radius > CANVAS_HEIGHT) return null

            // Paddle Collision
            const p = paddleRef.current
            if (
                nextY + ball.radius >= p.y && nextY - ball.radius <= p.y + p.height &&
                nextX + ball.radius >= p.x && nextX - ball.radius <= p.x + p.width
            ) {
                if (ball.dy > 0) {
                    nextY = p.y - ball.radius
                    const hitPoint = (nextX - (p.x + p.width / 2)) / (p.width / 2)
                    const bounceAngle = hitPoint * (Math.PI / 3) // 60 deg cone
                    const currentSpeed = Math.sqrt(nextDx * nextDx + nextDy * nextDy)
                    nextDx = currentSpeed * Math.sin(bounceAngle)
                    nextDy = -currentSpeed * Math.cos(bounceAngle)
                }
            }

            // Block Collision
            let hitBlockIndex = -1
            if (nextY - ball.radius < (10 * (BLOCK_HEIGHT + BLOCK_PADDING) + 120)) { // Optimization
                for (let i = 0; i < currentBlocks.length; i++) {
                    const block = currentBlocks[i]
                    if (!block.visible) continue

                    const closestX = Math.max(block.x, Math.min(nextX, block.x + block.width))
                    const closestY = Math.max(block.y, Math.min(nextY, block.y + block.height))
                    const distX = nextX - closestX
                    const distY = nextY - closestY

                    if ((distX * distX) + (distY * distY) < ball.radius * ball.radius) {
                        hitBlockIndex = i
                        const overlapX = (ball.radius + block.width / 2) - Math.abs(nextX - (block.x + block.width / 2))
                        const overlapY = (ball.radius + block.height / 2) - Math.abs(nextY - (block.y + block.height / 2))

                        if (overlapX < overlapY) {
                            nextDx = -nextDx
                            nextX += (nextX < block.x + block.width / 2) ? -overlapX : overlapX
                        } else {
                            nextDy = -nextDy
                            nextY += (nextY < block.y + block.height / 2) ? -overlapY : overlapY
                        }
                        break
                    }
                }
            }

            if (hitBlockIndex !== -1) {
                const block = currentBlocks[hitBlockIndex]
                const newHealth = (block.health || 1) - 1

                if (newHealth <= 0) {
                    currentBlocks[hitBlockIndex] = { ...block, visible: false, health: 0 }
                    scoreToAdd += block.points
                    if (block.hasPowerUp) {
                        const newPowerUp = createPowerUp(block.x, block.y)
                        if (newPowerUp) currentPowerUps.push(newPowerUp)
                    }
                } else {
                    // Block damaged but not destroyed
                    // Darken color or show damage state
                    currentBlocks[hitBlockIndex] = { ...block, health: newHealth }
                    scoreToAdd += 10 // Small points for hit
                }
            }

            return { ...ball, x: nextX, y: nextY, dx: nextDx, dy: nextDy }
        }).filter((b): b is Ball => b !== null)

        // Dead state
        if (currentBalls.length === 0) {
            currentLives -= 1
            if (currentLives > 0) {
                currentBalls = [{
                    x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40,
                    dx: INITIAL_BALL_SPEED * 0.707, dy: -INITIAL_BALL_SPEED * 0.707,
                    radius: BALL_RADIUS, speed: 1
                }]
            } else {
                setGameState(prev => ({ ...prev, lives: 0, isGameOver: true, isPlaying: false }))
            }
        }

        // PowerUps update
        const updatedPowerUps: PowerUp[] = []
        currentPowerUps.forEach(p => {
            const nextY = p.y + p.dy
            if (
                nextY + p.height >= paddleRef.current.y && nextY <= paddleRef.current.y + paddleRef.current.height &&
                p.x + p.width >= paddleRef.current.x && p.x <= paddleRef.current.x + paddleRef.current.width
            ) {
                applyPowerUp(p.type)
            } else if (nextY < CANVAS_HEIGHT) {
                updatedPowerUps.push({ ...p, y: nextY })
            }
        })

        if (currentBlocks.filter(b => b.visible).length === 0 && !gameStateRef.current.isPaused) {
            levelComplete = true
        }

        // --- RENDER ---
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        currentBlocks.forEach(block => {
            if (block.visible) {
                ctx.fillStyle = block.color
                // Fade color if damaged
                if (block.health < block.maxHealth) {
                    ctx.globalAlpha = 0.6
                }
                ctx.fillRect(block.x, block.y, block.width, block.height)
                ctx.globalAlpha = 1.0

                ctx.strokeStyle = '#fff'
                ctx.lineWidth = 1
                ctx.strokeRect(block.x, block.y, block.width, block.height)

                // Show crack or indicator for damaged blocks
                if (block.health < block.maxHealth) {
                    ctx.fillStyle = '#fff'
                    ctx.fillRect(block.x + 5, block.y + 10, block.width - 10, 2)
                }

                if (block.hasPowerUp) {
                    ctx.fillStyle = 'rgba(255,255,255,0.4)'
                    ctx.fillText('✨', block.x + block.width / 2 - 6, block.y + block.height / 2 + 4)
                }
            }
        })

        updatedPowerUps.forEach(p => {
            ctx.fillStyle = p.color
            ctx.shadowBlur = 10; ctx.shadowColor = p.color
            ctx.fillRect(p.x, p.y, p.width, p.height)
            ctx.font = '16px Arial'
            ctx.fillText(p.emoji, p.x + 4, p.y + 18)
            ctx.shadowBlur = 0
        })

        const pd = paddleRef.current
        const grad = ctx.createLinearGradient(pd.x, 0, pd.x + pd.width, 0)
        grad.addColorStop(0, '#00d9ff'); grad.addColorStop(1, '#0f3460')
        ctx.fillStyle = grad
        ctx.shadowBlur = 10; ctx.shadowColor = '#00d9ff'
        ctx.fillRect(pd.x, pd.y, pd.width, pd.height)
        ctx.shadowBlur = 0

        currentBalls.forEach(b => {
            ctx.beginPath()
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
            ctx.fillStyle = '#e94560'
            ctx.shadowBlur = 10; ctx.shadowColor = '#e94560'
            ctx.fill(); ctx.closePath(); ctx.shadowBlur = 0
        })

        if (gameStateRef.current.isPlaying && !gameStateRef.current.isGameOver) {
            if (scoreToAdd > 0) setGameState(prev => ({ ...prev, score: prev.score + scoreToAdd, lives: currentLives }))
            else if (currentLives !== gameStateRef.current.lives) setGameState(prev => ({ ...prev, lives: currentLives }))

            setBalls(currentBalls)
            setBlocks(currentBlocks)
            setPowerUps(updatedPowerUps)

            if (levelComplete) {
                const nextLevel = gameStateRef.current.level + 1
                setGameState(prev => ({ ...prev, level: nextLevel, isPaused: true }))
                setTimeout(() => {
                    generateLevel(nextLevel)
                    setBalls([{
                        x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40,
                        dx: INITIAL_BALL_SPEED * 0.707, dy: -INITIAL_BALL_SPEED * 0.707,
                        radius: BALL_RADIUS, speed: 1 + (nextLevel * 0.05)
                    }])
                    setPowerUps([])
                    setGameState(prev => ({ ...prev, isPaused: false }))
                }, 2000)
            }
            animationRef.current = requestAnimationFrame(gameLoop)
        }
    }, [generateLevel, applyPowerUp, createPowerUp])

    // Actions
    const startGame = () => {
        activePowerUpsRef.current.forEach(t => clearTimeout(t))
        activePowerUpsRef.current.clear()
        const startLevel = 1
        generateLevel(startLevel)
        setGameState({ score: 0, lives: 3, level: startLevel, isPlaying: true, isGameOver: false, isPaused: false })
        setBalls([{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40, dx: INITIAL_BALL_SPEED * 0.707, dy: -INITIAL_BALL_SPEED * 0.707, radius: BALL_RADIUS, speed: 1 }])
        setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, speed: PADDLE_SPEED })
        setPowerUps([])

        requestAnimationFrame(gameLoop)
    }

    const resetGame = () => {
        setGameState({ score: 0, lives: 3, level: 1, isPlaying: false, isGameOver: false, isPaused: false })
        setPowerUps([])
        if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }

    const pauseGame = () => {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))
        if (!gameState.isPaused) { /* pausing */ }
        else { requestAnimationFrame(gameLoop) }
    }

    return { canvasRef, gameState, startGame, pauseGame, resetGame }
}
