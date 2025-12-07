# 🚀 ScoreBoard Contract Deployment Guide

## ✅ Current Status

- **Deployer Address:** `0x21338b5Be646B545745aa8e072e475f7C2aA82c5`
- **Balance:** 0.0001 ETH on Base mainnet ✅
- **Contract:** `src/contracts/ScoreBoard.sol`
- **Network:** Base mainnet (Chain ID: 8453)

---

## 📝 Quick Deploy with Remix (Recommended)

### Step 1: Open Remix
Go to https://remix.ethereum.org

### Step 2: Load Contract
1. Create new file: `ScoreBoard.sol`
2. Copy and paste the contract code from `src/contracts/ScoreBoard.sol`

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

### Step 3: Compile
1. Click "Solidity Compiler" tab (left sidebar)
2. Select compiler version: **0.8.20**
3. Click "Compile ScoreBoard.sol"
4. Wait for green checkmark ✅

### Step 4: Setup MetaMask
1. Open MetaMask extension
2. Switch network to **Base** (or add it if not present)
   - Network Name: Base
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: `8453`
   - Currency: ETH
   - Block Explorer: `https://basescan.org`

3. Import your deployer account:
   - Click Account icon → Import Account
   - Paste private key: `0x0d8350a5d159399ffd734c6554890ddde021da89c33246948d4310567df64bc6`
   - ⚠️ **WARNING:** This key is for this project only!

### Step 5: Deploy
1. Click "Deploy & Run Transactions" tab
2. Environment: Select **"Injected Provider - MetaMask"**
3. Confirm MetaMask is on **Base mainnet**
4. Contract: Select **"ScoreBoard"**
5. Click **"Deploy"** button (orange)
6. Confirm transaction in MetaMask popup
7. Wait for confirmation (~5-10 seconds)

### Step 6: Get Contract Address
1. After deployment, expand the deployed contract section
2. Copy the contract address (starts with `0x...`)
3. Example: `0x1234567890abcdef...`

### Step 7: Update Code
1. Open `src/hooks/useScoreContract.ts`
2. Find line ~8: `const CONTRACT_ADDRESS = '0xYourScoreBoardContractAddress'`
3. Replace with your actual deployed address
4. Save the file

### Step 8: Verify on BaseScan
1. Go to https://basescan.org
2. Search for your contract address
3. You should see the deployment transaction

---

## 🔍 Verify Deployment

Test the contract on BaseScan or Remix:

```javascript
// Test saveScore (write function)
saveScore(1000, 1)  // score: 1000, level: 1

// Test getPlayerScore (read function)
getPlayerScore("0x21338b5Be646B545745aa8e072e475f7C2aA82c5")

// Test getTopScores (read function)
getTopScores()
```

---

## 📋 After Deployment Checklist

- [ ] Contract deployed on Base mainnet
- [ ] Contract address copied
- [ ] Updated `src/hooks/useScoreContract.ts` with new address
- [ ] Verified contract on BaseScan
- [ ] Tested contract functions
- [ ] Ready to start dev server!

---

## 🎮 Next Steps

Once contract is deployed and code updated:

```bash
npm run dev
```

Open http://localhost:3000 and test the game!

---

## 🆘 Troubleshooting

**Problem:** MetaMask shows "Insufficient funds"
**Solution:** Your account has 0.0001 ETH. You may need to add more ETH if gas cost exceeds this (typical: ~0.001-0.003 ETH)

**Problem:** Transaction fails
**Solution:** Try increasing gas limit in MetaMask advanced settings

**Problem:** Can't find deployed contract
**Solution:** Check BaseScan with your deployer address to see transaction history

---

## 💡 Alternative: Deploy via Script (if Remix doesn't work)

If you prefer command line, you can compile with `solc`:

```bash
npm install -g solc
solcjs --bin --abi src/contracts/ScoreBoard.sol
# Then use the bytecode in deploy script
```

But Remix is easier and more reliable! 🎯
