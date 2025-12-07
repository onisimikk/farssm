'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onStart: () => void
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onStart()
    }, 300)
  }

  return (
    <div className={`splash-screen ${isAnimating ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-banner">
          <div className="splash-logo">
            <Image
              src="/logo.png"
              alt="Block Breaker Logo"
              width={200}
              height={200}
              className="logo-image"
              priority
            />
          </div>
          <h1 className="splash-title">BLOCK BREAKER</h1>
          <div className="splash-subtitle">Classic Arcade on Base Blockchain</div>
        </div>

        <div className="splash-features">
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span>Break All Blocks</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Collect Power-ups</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🏆</span>
            <span>Save Scores On-Chain</span>
          </div>
        </div>

        <button className="splash-button" onClick={handleClick}>
          <span className="button-text">CLICK TO START</span>
          <span className="button-arrow">→</span>
        </button>

        <div className="splash-controls">
          <div className="control-hint">
            <span>🖱️ Mouse / Touch</span>
            <span>⌨️ Arrow Keys</span>
          </div>
        </div>
      </div>

      <div className="splash-decoration">
        <div className="floating-block block-1">■</div>
        <div className="floating-block block-2">■</div>
        <div className="floating-block block-3">■</div>
        <div className="floating-block block-4">■</div>
      </div>

      <style jsx>{`
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          transition: opacity 0.3s ease-out;
        }

        .splash-logo {
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo-image {
          width: 200px;
          height: 200px;
          object-fit: contain;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 10px 30px rgba(0, 217, 255, 0.5));
        }

        .splash-screen.fade-out {
          opacity: 0;
        }

        .splash-content {
          text-align: center;
          position: relative;
          z-index: 2;
          max-width: 600px;
          padding: 40px;
        }

        .splash-banner {
          margin-bottom: 50px;
        }

        .splash-title {
          font-size: 56px;
          font-weight: 900;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #e94560 0%, #ff6b9d 50%, #fec163 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 40px rgba(233, 69, 96, 0.5);
          letter-spacing: 5px;
          animation: glow 2s ease-in-out infinite;
        }

        .splash-subtitle {
          font-size: 20px;
          color: #00d9ff;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .splash-features {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: nowrap;
          padding: 0 20px;
        }

        .feature-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #fff;
          opacity: 0.9;
          white-space: nowrap;
        }

        .feature-icon {
          font-size: 18px;
          animation: float 3s ease-in-out infinite;
        }

        .splash-button {
          background: linear-gradient(135deg, #e94560 0%, #533483 100%);
          border: none;
          padding: 20px 50px;
          font-size: 24px;
          font-weight: 700;
          color: white;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(233, 69, 96, 0.4);
          display: inline-flex;
          align-items: center;
          gap: 15px;
          letter-spacing: 2px;
        }

        .splash-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 40px rgba(233, 69, 96, 0.6);
        }

        .splash-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .button-arrow {
          font-size: 28px;
          transition: transform 0.3s ease;
        }

        .splash-button:hover .button-arrow {
          transform: translateX(5px);
        }

        .splash-controls {
          margin-top: 40px;
          opacity: 0.7;
        }

        .control-hint {
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 14px;
          color: #00d9ff;
        }

        .splash-decoration {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }

        .floating-block {
          position: absolute;
          font-size: 60px;
          opacity: 0.1;
          animation: float-around 15s infinite ease-in-out;
        }

        .block-1 {
          top: 10%;
          left: 10%;
          color: #e94560;
          animation-delay: 0s;
        }

        .block-2 {
          top: 70%;
          right: 15%;
          color: #00d9ff;
          animation-delay: 2s;
        }

        .block-3 {
          bottom: 15%;
          left: 20%;
          color: #ffb400;
          animation-delay: 4s;
        }

        .block-4 {
          top: 40%;
          right: 10%;
          color: #7f5af0;
          animation-delay: 6s;
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(233, 69, 96, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(233, 69, 96, 0.8));
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-around {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(30px, -30px) rotate(90deg);
          }
          50% {
            transform: translate(0, -60px) rotate(180deg);
          }
          75% {
            transform: translate(-30px, -30px) rotate(270deg);
          }
        }

        @media (max-width: 768px) {
          .splash-title {
            font-size: 48px;
          }

          .splash-features {
            gap: 10px;
            padding: 0 10px;
          }

          .feature-item {
            font-size: 9px;
            gap: 3px;
          }

          .feature-icon {
            font-size: 14px;
          }

          .splash-button {
            padding: 15px 35px;
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}
