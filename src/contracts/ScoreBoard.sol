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
