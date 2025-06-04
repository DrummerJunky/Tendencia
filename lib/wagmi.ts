
'use client';
import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"
import { QueryClient } from "@tanstack/react-query"

export const wagmiConfig = getDefaultConfig({
  appName: "VotaSeguro",
  projectId: "YOUR_PROJECT_ID", // Reemplaza con tu Project ID de WalletConnect
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // Si tu app usa SSR
})

export const queryClient = new QueryClient()
