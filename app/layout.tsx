import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { VotingProvider } from "@/contexts/voting-context"
import { Navigation } from "@/components/navigation"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig, queryClient } from "@/lib/wagmi"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider>
              <VotingProvider>
                <div className="min-h-screen bg-gray-50">
                  <Navigation />
                  <main>{children}</main>
                </div>
              </VotingProvider>
            </RainbowKitProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
