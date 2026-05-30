import sdk from '@farcaster/miniapp-sdk'
import { BASE_CHAIN_ID_HEX } from '@/app/config/base'

type MiniAppEthereumProvider = {
    request: <T>(args: { method: string; params?: unknown[] }) => Promise<T>
}

type WalletSendCallsResult = string | {
    bundleId?: string
    id?: string
}

function getBundleId(result: WalletSendCallsResult): string {
    if (typeof result === 'string') return result
    return result.bundleId || result.id || ''
}

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
        const ethProvider = sdk.wallet.ethProvider as unknown as MiniAppEthereumProvider
        // Get the user's wallet address
        const accounts = await ethProvider.request<string[]>({
            method: 'eth_accounts',
        })

        if (!accounts || accounts.length === 0) {
            throw new Error('No wallet connected')
        }

        // Use wallet_sendCalls (EIP-5792) to batch transactions
        const result = await ethProvider.request<WalletSendCallsResult>({
            method: 'wallet_sendCalls',
            params: [{
                version: '1.0',
                chainId: BASE_CHAIN_ID_HEX,
                from: accounts[0],
                calls: calls.map(call => ({
                    to: call.to,
                    data: call.data,
                    value: call.value || '0x0',
                })),
            }],
        })

        return {
            success: true,
            bundleId: getBundleId(result),
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
    } catch {
        console.log('Batching not supported, using standard transaction')
        const ethProvider = sdk.wallet.ethProvider as unknown as MiniAppEthereumProvider

        // Fallback to regular transaction
        const txHash = await ethProvider.request<string>({
            method: 'eth_sendTransaction',
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
