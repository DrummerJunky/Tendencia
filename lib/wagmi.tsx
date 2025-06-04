"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia, mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";

const config = getDefaultConfig({
  appName: "VotaSeguro",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "27b07eea22c09d38aa225c7b0163728c", 
  chains: [sepolia, mainnet, polygon, arbitrum, optimism, base],
  ssr: false,
});

const queryClient = new QueryClient();

export { config as wagmiConfig, queryClient };

export default function WagmiWrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}