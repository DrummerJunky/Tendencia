// app/layout.tsx
import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { VotingProvider } from "@/contexts/voting-context";
import { Navigation } from "@/components/navigation";
// Importamos el wrapper que creamos en lib/wagmi.tsx
import WagmiWrapper from "@/lib/wagmi";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 
          Aquí envolvemos toda la app en WagmiWrapper.
          WagmiWrapper internamente hace:
            <WagmiConfig config={...}>
              <QueryClientProvider client={...}>
                {children}
              </QueryClientProvider>
            </WagmiConfig>
        */}
        <WagmiWrapper>
          {/* Tu contexto off-chain (VotingProvider), navegación y contenido */}
          <VotingProvider>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main>{children}</main>
            </div>
          </VotingProvider>
        </WagmiWrapper>
      </body>
    </html>
  );
}

export const metadata = {
  generator: "v0.dev",
};
