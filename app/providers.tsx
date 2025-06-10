// app/providers.tsx
"use client"

import React from "react"
import WagmiWrapper from "@/lib/wagmi"
import { VotingProvider } from "@/contexts/voting-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiWrapper>
      <VotingProvider>{children}</VotingProvider>
    </WagmiWrapper>
  )
}
