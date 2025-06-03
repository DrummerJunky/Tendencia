import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { VotingProvider } from "@/contexts/voting-context";
import { Navigation } from "@/components/navigation";
import { ThirdwebWrapper } from "./providers/thirdweb-provider"; // 👈 Importa el wrapper

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VotaSeguro - Sistema de Votación Descentralizado",
  description: "Plataforma de votación electrónica basada en blockchain",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThirdwebWrapper>
          <VotingProvider>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main>{children}</main>
            </div>
          </VotingProvider>
        </ThirdwebWrapper>
      </body>
    </html>
  );
}
