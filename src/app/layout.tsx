import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.vercel.app'

export const metadata: Metadata = {
    title: "Block Breaker - Play on Base",
    description: "Classic brick breaker game with blockchain score saving on Base",
    openGraph: {
        title: "Block Breaker - Play on Base",
        description: "Classic arcade game with blockchain score persistence",
        images: [{
            url: `${APP_URL}/splash.png`,
            width: 1200,
            height: 630,
            alt: "Block Breaker Game",
        }],
    },
    other: {
        "fc:frame": "vNext",
        "fc:miniapp": JSON.stringify({
            version: "1",
            imageUrl: `${APP_URL}/splash.png`,
            button: {
                title: "🎮 Play Now",
                action: {
                    type: "launch_miniapp",
                    name: "Block Breaker",
                    url: APP_URL
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
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
