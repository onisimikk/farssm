# Farcaster Frame + Base Mini App Template Guide

Complete setup guide for creating any app that passes Farcaster Frame verification and Base Build submission requirements.

---

## Project Requirements

- Next.js 14+ with App Router
- TypeScript
- Deployed on Vercel
- Smart contract on Base mainnet (chainId: 8453)
- Custom domain or vercel.app subdomain

---

## File Structure

```
project-root/
├── public/
│   ├── .well-known/
│   │   └── farcaster.json          # Required: Frame manifest
│   ├── icon.png                     # 1024x1024 app icon
│   ├── splash.png                   # 1200x630 splash/hero image
│   └── manifest.json                # Optional: Standalone manifest
│
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   └── wagmi.ts            # Wagmi config for Base
│   │   ├── layout.tsx              # Root layout with metadata
│   │   ├── providers.tsx           # Wagmi + React Query + MiniApp SDK
│   │   ├── page.tsx                # Main app page
│   │   └── globals.css             # Global styles
│   │
│   ├── components/
│   │   └── ConnectWallet.tsx       # Optional wallet connection
│   │
│   ├── hooks/
│   │   └── useContract.ts          # Smart contract hooks
│   │
│   └── contracts/
│       └── YourABI.ts              # Contract ABI
│
├── .gitignore
├── package.json
├── next.config.js
└── tsconfig.json
```

---

## Step 1: Install Dependencies

```bash
npm install wagmi viem @tanstack/react-query
npm install @farcaster/miniapp-sdk
```

### package.json essentials:

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "wagmi": "^3.0.0",
    "viem": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@farcaster/miniapp-sdk": "^0.1.0"
  }
}
```

---

## Step 2: Farcaster Frame Configuration

### File: `public/.well-known/farcaster.json`

This is the **most important file**. Base Build reads this to import your app.

```json
{
  "accountAssociation": {
    "header": "BASE64_ENCODED_HEADER",
    "payload": "BASE64_ENCODED_PAYLOAD",
    "signature": "SIGNATURE_FROM_WARPCAST"
  },
  "miniapp": {
    "version": "1",
    "name": "App Name",
    "subtitle": "One-line description (20 words max)",
    "description": "Brief description of what your app does and its main features",
    "screenshotUrls": ["https://yourdomain.vercel.app/screenshot.png"],
    "iconUrl": "https://yourdomain.vercel.app/icon.png",
    "splashImageUrl": "https://yourdomain.vercel.app/splash.png",
    "splashBackgroundColor": "#000000",
    "homeUrl": "https://yourdomain.vercel.app",
    "webhookUrl": "https://yourdomain.vercel.app/api/frame",
    "primaryCategory": "games",
    "tags": ["blockchain", "nft", "defi"],
    "heroImageUrl": "https://yourdomain.vercel.app/splash.png",
    "tagline": "Short 5-word tagline",
    "ogTitle": "App Name - Tagline",
    "ogDescription": "Social sharing description",
    "ogImageUrl": "https://yourdomain.vercel.app/splash.png"
  },
  "baseBuilder": {
    "ownerAddress": "0xYOUR_WALLET_ADDRESS"
  }
}
```

**How to get accountAssociation:**
1. Go to https://warpcast.com/~/developers/frames
2. Create frame with your URL: `https://yourdomain.vercel.app`
3. Copy the generated `header`, `payload`, `signature`

**baseBuilder.ownerAddress:**
- Use the wallet address you sign in with on https://build.base.org

---

## Step 3: Next.js Layout with Frame Metadata

### File: `src/app/layout.tsx`

```typescript
import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your app description",
  openGraph: {
    title: "Your App Name",
    description: "Description for social sharing",
    images: [{
      url: "https://yourdomain.vercel.app/splash.png",
      width: 1200,
      height: 630,
      alt: "Your App",
    }],
  },
  other: {
    "fc:frame": "vNext",
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://yourdomain.vercel.app/splash.png",
      button: {
        title: "🚀 Launch App",
        action: {
          type: "launch_miniapp",
          url: "https://yourdomain.vercel.app"
        }
      }
    }),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## Step 4: Providers Setup

### File: `src/app/providers.tsx`

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
    // Initialize Farcaster MiniApp SDK
    const load = async () => {
      await sdk.actions.ready()
    }
    load()
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

---

## Step 5: Wagmi Configuration

### File: `src/app/config/wagmi.ts`

```typescript
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: true,
})
```

---

## Step 6: Smart Contract Integration

### File: `src/hooks/useContract.ts`

**IMPORTANT:** Hardcode contract address. Do NOT use environment variables for Vercel deployment.

```typescript
'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { YOUR_CONTRACT_ABI } from '@/contracts/YourABI'

// Hardcoded contract address on Base mainnet
const CONTRACT_ADDRESS = '0xYourContractAddressHere' as `0x${string}`

export function useYourContract() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const performAction = (param1: string, param2: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: YOUR_CONTRACT_ABI,
      functionName: 'yourFunctionName',
      args: [param1, BigInt(param2)],
    })
  }

  return {
    performAction,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  }
}

// Read contract data
export function useReadContractData(userAddress?: `0x${string}`) {
  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: YOUR_CONTRACT_ABI,
    functionName: 'getUserData',
    args: userAddress ? [userAddress] : undefined,
  })

  return { data, refetch }
}
```

---

## Step 7: Guest Mode Implementation (Required for Base Build)

### localStorage persistence for guest users:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export function useAppData() {
  const { address, isConnected } = useAccount()

  // Initialize from localStorage
  const [localData, setLocalData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_data')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved data:', e)
        }
      }
    }
    return { /* default data */ }
  })

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_data', JSON.stringify(localData))
    }
  }, [localData])

  // Save to blockchain (only when connected)
  const saveToBlockchain = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet to save on-chain!")
      return
    }

    // Your blockchain save logic here
  }

  return {
    data: localData,
    setData: setLocalData,
    saveToBlockchain,
    isConnected,
  }
}
```

### Main page implementation:

```typescript
'use client'

import { useAppData } from '@/hooks/useAppData'

export default function Home() {
  const { data, setData, saveToBlockchain, isConnected } = useAppData()

  return (
    <main>
      <h1>Your App</h1>

      {/* Users can interact without connecting wallet */}
      <div>
        {/* Your app UI here */}
      </div>

      {/* Show save button when there are changes */}
      <button onClick={saveToBlockchain}>
        💾 Save on Base
      </button>

      {/* Optional: Show connection status */}
      {!isConnected && (
        <p>Connect wallet to save your progress on-chain</p>
      )}
    </main>
  )
}
```

---

## Step 8: Wallet Connection Component (Optional)

### File: `src/components/ConnectWallet.tsx`

```typescript
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [showOptions, setShowOptions] = useState(false)

  if (isConnected) {
    return (
      <button onClick={() => disconnect()}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return (
    <div>
      <button onClick={() => setShowOptions(!showOptions)}>
        Sign In
      </button>

      {showOptions && (
        <div>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => {
                connect({ connector })
                setShowOptions(false)
              }}
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Step 9: Deployment

### Vercel Deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
npx vercel --prod
```

### Critical Vercel Settings:

1. **Disable Deployment Protection:**
   - Go to Project Settings → Deployment Protection
   - Set to "Only Preview Deployments" or disable
   - This makes `/.well-known/farcaster.json` publicly accessible

2. **No Environment Variables Needed:**
   - Hardcode contract addresses in code
   - Easier deployment, fewer errors

3. **Assign Custom Domain (Optional):**
   ```bash
   npx vercel alias your-deployment.vercel.app yourdomain.com
   ```

---

## Step 10: Farcaster Frame Verification

1. Go to https://warpcast.com/~/developers/frames
2. Click "Create Frame"
3. Enter your URL: `https://yourdomain.vercel.app`
4. Warpcast generates account association
5. Copy `header`, `payload`, `signature`
6. Paste into `public/.well-known/farcaster.json` under `accountAssociation`
7. Redeploy

### Test Frame:
- Share your URL in a Warpcast post
- Should show frame preview with your splash image
- Button should launch your app

---

## Step 11: Base Build Submission

### Before Submitting:

✅ Verify `farcaster.json` is accessible:
```bash
curl https://yourdomain.vercel.app/.well-known/farcaster.json
```

✅ Must return JSON with all 3 sections:
- `accountAssociation` (from Warpcast)
- `miniapp` (your app metadata)
- `baseBuilder` (your wallet address)

### Submit to Base Build:

1. Go to https://build.base.org
2. Sign in with wallet
3. Click "Import your mini app"
4. Enter URL: `https://yourdomain.vercel.app`
5. System validates your `farcaster.json`
6. If `baseBuilder.ownerAddress` doesn't match, update it to the wallet you used to sign in
7. Complete the submission form

### Base Build Requirements Checklist:

- ✅ **Guest Mode:** Users can explore without signing in
- ✅ **No External Redirects:** Authentication stays in Base app
- ✅ **Optional Sign-in:** Only required for blockchain operations
- ✅ **Client-Agnostic:** No "Farcaster only" or client-specific features
- ✅ **Batch Transactions:** Combine sequential operations when possible

---

## Common Issues & Solutions

### Issue: "Contract address not configured"
**Solution:** Hardcode address in `useContract.ts`, don't use `process.env`

### Issue: "Invalid manifest format"
**Solution:** Ensure `farcaster.json` has all 3 sections: accountAssociation, miniapp, baseBuilder

### Issue: 401 Unauthorized accessing farcaster.json
**Solution:** Disable Vercel Deployment Protection

### Issue: Base Build can't verify ownership
**Solution:** `baseBuilder.ownerAddress` must match wallet used to sign in to Base Build

### Issue: Frame not showing in Warpcast
**Solution:**
- Check `fc:frame` and `fc:miniapp` in layout.tsx metadata
- Verify accountAssociation is correct
- Test with https://warpcast.com/~/developers/frames-tester

---

## RPC Endpoints for Base

### Public RPCs (Free):
- `https://mainnet.base.org` (Recommended)
- `https://base.drpc.org`
- `https://base.meowrpc.com`

### Premium RPCs:
- Alchemy: `https://base-mainnet.g.alchemy.com/v2/YOUR_KEY`
- Infura: `https://base-mainnet.infura.io/v3/YOUR_KEY`

### Testnet (Base Sepolia):
- `https://sepolia.base.org`

---

## Complete Example Templates

### Minimal App Structure:

```
your-app/
├── public/
│   ├── .well-known/farcaster.json
│   ├── icon.png
│   └── splash.png
├── src/
│   ├── app/
│   │   ├── config/wagmi.ts
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── hooks/
│   │   └── useContract.ts
│   └── contracts/
│       └── YourABI.ts
└── package.json
```

### Deployment Commands:

```bash
# 1. Build locally to test
npm run build

# 2. Deploy to Vercel
npx vercel --prod

# 3. Verify farcaster.json
curl https://yourapp.vercel.app/.well-known/farcaster.json | jq .

# 4. Test in Warpcast
# Share link in post to see frame preview

# 5. Submit to Base Build
# Go to https://build.base.org
```

---

## Best Practices

1. **Always Hardcode Addresses:** No environment variables for contract addresses
2. **Test Locally First:** `npm run dev` before deploying
3. **Use Same Image:** icon.png, splash.png, heroImageUrl can all be the same
4. **Guest Mode First:** Let users explore before requiring wallet
5. **Clear Error Messages:** Tell users why they need to connect wallet
6. **Batch Operations:** Combine multiple contract calls to reduce signatures
7. **Public Deployment:** Disable all Vercel protection for `/.well-known/`

---

## Submission Form Answers

**Does your app's authentication flow keep the user entirely inside the Base app?**
→ **YES** (if you implemented guest mode and optional wallet connection)

**Have you removed any client-specific behaviors?**
→ **YES** (if no "Farcaster only" messaging)

**Do you batch sequential on-chain actions?**
→ **YES** (if using contract-level batching or EIP-5792)

**Short Tagline (~5 words):**
→ e.g., "Build, play, earn on-chain"

**Brief Description (~20 words):**
→ e.g., "A decentralized app where users can interact, transact, and save progress on Base blockchain network."

---

## Reference Links

- Farcaster Frames Docs: https://docs.farcaster.xyz/reference/frames/spec
- Base Mini Apps: https://docs.base.org/mini-apps
- Wagmi Docs: https://wagmi.sh
- MiniApp SDK: https://github.com/farcasterxyz/miniapp-sdk
- Base Build: https://build.base.org
- Warpcast Frames: https://warpcast.com/~/developers/frames

---

**This template ensures your app will:**
✅ Pass Farcaster Frame verification
✅ Import successfully to Base Build
✅ Meet all Base Build submission requirements
✅ Work in Warpcast, Base app, and web browsers
