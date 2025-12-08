import sdk from '@farcaster/miniapp-sdk'

/**
 * Batch multiple contract calls into a single transaction using EIP-5792
 * This minimizes signature prompts for sequential on-chain actions
 */
export async function batchTransactions(calls: Array<{
    to: string
    data: string
    value?: string
}>) {
    try {
        // Get the user's wallet address
        const accounts = await sdk.wallet.ethProvider.request({
            method: 'eth_accounts' as any,
        }) as string[]

        if (!accounts || accounts.length === 0) {
            throw new Error('No wallet connected')
        }

        // Use wallet_sendCalls (EIP-5792) to batch transactions
        const result = await sdk.wallet.ethProvider.request({
            method: 'wallet_sendCalls' as any,
            params: [{
                version: '1.0',
                chainId: '0x2105', // Base mainnet (8453 in hex)
                from: accounts[0],
                calls: calls.map(call => ({
                    to: call.to,
                    data: call.data,
                    value: call.value || '0x0',
                })),
            }],
        }) as any

        return {
            success: true,
            bundleId: result.bundleId || result,
        }
    } catch (error) {
        console.error('Batch transaction failed:', error)
        throw error
    }
}

/**
 * Send a single transaction with EIP-5792 compatibility
 * Falls back to eth_sendTransaction if batching is not supported
 */
export async function sendTransaction(call: {
    to: string
    data: string
    value?: string
}) {
    try {
        // Try batching first (even for single transaction)
        return await batchTransactions([call])
    } catch (batchError) {
        console.log('Batching not supported, using standard transaction')

        // Fallback to regular transaction
        const txHash = await sdk.wallet.ethProvider.request({
            method: 'eth_sendTransaction' as any,
            params: [{
                to: call.to,
                data: call.data,
                value: call.value || '0x0',
            }],
        }) as string

        return {
            success: true,
            bundleId: txHash,
        }
    }
}
