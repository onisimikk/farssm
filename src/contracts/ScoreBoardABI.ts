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
