'use client'

import { useTopScores } from '@/hooks/useScoreContract'
import { useEffect } from 'react'

export default function Leaderboard() {
  const { topScores, refetch } = useTopScores()

  // Auto-refresh on mount
  useEffect(() => {
    refetch()
  }, [refetch])

  // Format blockchain scores
  const blockchainScores = topScores ? topScores.map((score: any) => ({
    address: score.player,
    score: Number(score.score),
    level: Number(score.level),
    timestamp: Number(score.timestamp),
  })) : []

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">🏆 Top Scores</h2>
        <button className="refresh-button" onClick={() => refetch()} title="Refresh">
          🔄
        </button>
      </div>

      <div className="leaderboard-content">
        {blockchainScores.length === 0 ? (
          <div className="empty-state">
            <p>⛓️ No scores on Base yet</p>
            <p className="empty-hint">Be the first to save your score on-chain!</p>
          </div>
        ) : (
          <div className="scores-list">
            {blockchainScores.slice(0, 10).map((score, index) => (
              <div key={index} className={`score-entry rank-${index + 1}`}>
                <div className="rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                <div className="player-info">
                  <div className="player-address">
                    {score.address === 'Guest'
                      ? '👤 Guest Player'
                      : `${score.address.slice(0, 6)}...${score.address.slice(-4)}`
                    }
                  </div>
                  <div className="player-stats">
                    Level {score.level}
                  </div>
                </div>
                <div className="score-value">
                  {score.score.toLocaleString()}
                  <span className="score-label">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .leaderboard-container {
          width: 100%;
          max-width: 600px;
          background: rgba(15, 52, 96, 0.3);
          border-radius: 16px;
          padding: 30px;
          border: 2px solid rgba(0, 217, 255, 0.3);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .leaderboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 25px;
        }

        .leaderboard-title {
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(135deg, #e94560 0%, #ff6b9d 50%, #fec163 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .refresh-button {
          background: rgba(15, 52, 96, 0.5);
          border: 2px solid rgba(0, 217, 255, 0.3);
          border-radius: 50%;
          width: 45px;
          height: 45px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #fff;
        }

        .refresh-button:hover {
          background: rgba(15, 52, 96, 0.8);
          border-color: rgba(0, 217, 255, 0.6);
          transform: rotate(180deg);
        }

        .refresh-button:active {
          transform: rotate(180deg) scale(0.9);
        }

        .leaderboard-content {
          min-height: 300px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state p {
          margin: 10px 0;
          font-size: 18px;
        }

        .empty-hint {
          font-size: 14px;
          color: #00d9ff;
        }

        .scores-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .score-entry {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .score-entry:hover {
          background: rgba(0, 0, 0, 0.5);
          border-color: rgba(0, 217, 255, 0.4);
          transform: translateX(5px);
        }

        .score-entry.rank-1 {
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        .score-entry.rank-2 {
          border-color: #C0C0C0;
          box-shadow: 0 0 20px rgba(192, 192, 192, 0.3);
        }

        .score-entry.rank-3 {
          border-color: #CD7F32;
          box-shadow: 0 0 20px rgba(205, 127, 50, 0.3);
        }

        .rank {
          font-size: 24px;
          font-weight: 900;
          min-width: 50px;
          text-align: center;
        }

        .player-info {
          flex: 1;
        }

        .player-address {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }

        .player-stats {
          font-size: 12px;
          color: #00d9ff;
        }

        .score-value {
          font-size: 24px;
          font-weight: 900;
          color: #e94560;
          text-align: right;
          min-width: 120px;
        }

        .score-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin-left: 5px;
        }

        @media (max-width: 768px) {
          .leaderboard-container {
            padding: 20px;
          }

          .leaderboard-title {
            font-size: 24px;
          }

          .score-entry {
            padding: 12px 15px;
            gap: 10px;
          }

          .rank {
            font-size: 18px;
            min-width: 40px;
          }

          .player-address {
            font-size: 14px;
          }

          .score-value {
            font-size: 18px;
            min-width: 80px;
          }
        }
      `}</style>
    </div>
  )
}
