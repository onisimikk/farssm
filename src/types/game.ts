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
    hasPowerUp?: boolean
    health: number
    maxHealth: number
}

export type PowerUpType = 'extraBall' | 'expandPaddle' | 'shrinkPaddle' | 'speedUp' | 'slowDown' | 'extraLife'

export interface PowerUp {
    x: number
    y: number
    dy: number
    width: number
    height: number
    type: PowerUpType
    color: string
    emoji: string
    active: boolean
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
