# Farcaster Frame + Base Mini App - Quick Setup

## Install
```bash
npm install wagmi viem @tanstack/react-query @farcaster/miniapp-sdk
```

## Required Files

### 1. `public/.well-known/farcaster.json`
```json
{
  "accountAssociation": {
    "header": "GET_FROM_WARPCAST",
    "payload": "GET_FROM_WARPCAST",
    "signature": "GET_FROM_WARPCAST"
  },
  "miniapp": {
    "version": "1",
    "name": "App Name",
    "subtitle": "Short description",
    "description": "What your app does",
    "screenshotUrls": ["https://yourapp.vercel.app/splash.png"],
    "iconUrl": "https://yourapp.vercel.app/icon.png",
    "splashImageUrl": "https://yourapp.vercel.app/splash.png",
    "splashBackgroundColor": "#000000",
    "homeUrl": "https://yourapp.vercel.app",
    "webhookUrl": "https://yourapp.vercel.app/api/frame",
    "primaryCategory": "games",
    "tags": ["tag1", "tag2"],
    "heroImageUrl": "https://yourapp.vercel.app/splash.png",
    "tagline": "5 word tagline",
    "ogTitle": "App Name",
    "ogDescription": "Description",
    "ogImageUrl": "https://yourapp.vercel.app/splash.png"
  },
  "baseBuilder": {
    "ownerAddress": "0xYOUR_WALLET_FROM_BASE_BUILD"
  }
}
```

### 2. `src/app/config/wagmi.ts`
```typescript
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [injected({ shimDisconnect: true })],
  transports: { [base.id]: http('https://mainnet.base.org') },
  ssr: true,
})
```

### 3. `src/app/providers.tsx`
```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import sdk from '@farcaster/miniapp-sdk'
import { config } from '@/app/config/wagmi'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    sdk.actions.ready()
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

### 4. `src/app/layout.tsx`
```typescript
import { Providers } from './providers'

export const metadata = {
  title: "App Name",
  description: "Description",
  openGraph: {
    title: "App Name",
    description: "Description",
    images: [{ url: "https://yourapp.vercel.app/splash.png" }],
  },
  other: {
    "fc:frame": "vNext",
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://yourapp.vercel.app/splash.png",
      button: {
        title: "Launch App",
        action: { type: "launch_miniapp", url: "https://yourapp.vercel.app" }
      }
    }),
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
```

### 5. `src/hooks/useContract.ts`
```typescript
'use client'
import { useWriteContract } from 'wagmi'
import { YOUR_ABI } from '@/contracts/YourABI'

const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS' as `0x${string}`

export function useYourContract() {
  const { writeContract } = useWriteContract()

  const doAction = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: YOUR_ABI,
      functionName: 'yourFunction',
      args: [],
    })
  }

  return { doAction }
}
```

### 6. Guest Mode (Required for Base Build)
```typescript
'use client'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export function useAppData() {
  const { isConnected } = useAccount()

  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_data')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_data', JSON.stringify(data))
    }
  }, [data])

  const saveOnChain = () => {
    if (!isConnected) {
      alert("Connect wallet to save on-chain!")
      return
    }
    // Save logic here
  }

  return { data, setData, saveOnChain }
}
```

## Setup Steps

1. **Get Farcaster Account Association:**
   - https://warpcast.com/~/developers/frames
   - Create frame with your URL
   - Copy `header`, `payload`, `signature` to `farcaster.json`

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

3. **Disable Deployment Protection:**
   - Vercel Dashboard → Settings → Deployment Protection → Disable

4. **Submit to Base Build:**
   - https://build.base.org
   - Import with your URL
   - Update `baseBuilder.ownerAddress` to match your wallet

## Key Rules

✅ Hardcode contract addresses (no env vars)
✅ Allow users to play without connecting wallet
✅ Only require wallet for blockchain saves
✅ Use `https://mainnet.base.org` for RPC
✅ Make `/.well-known/farcaster.json` public

## Test

```bash
# Verify farcaster.json
curl https://yourapp.vercel.app/.well-known/farcaster.json

# Share in Warpcast to test frame
```

## Common Errors

- "Contract address not configured" → Hardcode it
- "Invalid manifest" → Check all 3 sections in farcaster.json
- "401 Unauthorized" → Disable Vercel protection
- Ownership verification failed → Match baseBuilder.ownerAddress to wallet
