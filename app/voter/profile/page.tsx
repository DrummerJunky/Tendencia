// app/voter/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVoting } from "@/contexts/voting-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import { CheckCircle, AlertTriangle, Vote } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function VoterProfilePage() {
  const { user, isAdmin } = useVoting();
  const router = useRouter();

  // Wagmi hook para saber si hay wallet conectada
  const { isConnected, address } = useAccount();
  // Hook para desconectar (opcional)
  const { disconnect } = useDisconnect();

  // Si no hay usuario o es admin, redirige a /login
  useEffect(() => {
    if (!user || isAdmin) {
      router.push("/login");
    }
  }, [user, isAdmin, router]);

  if (!user) {
    return <div className="p-4">Cargando…</div>;
  }

  return (
    <div className="p-4">
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Estado de tu Wallet</CardTitle>
          <CardDescription>
            Conecta MetaMask (u otra wallet compatible) para poder votar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {isConnected ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="text-green-700 font-medium">
                Wallet Conectada
              </span>
              <p className="text-sm text-gray-600 mt-2">
                Dirección: {address}
              </p>
              <Button
                variant="secondary"
                onClick={() => disconnect()}
                className="mt-2"
              >
                Desconectar
              </Button>
            </>
          ) : (
            <>
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <span className="text-yellow-700 font-medium">
                Wallet No Conectada
              </span>
              <p className="text-sm text-gray-600 mt-2">
                Debes conectar una wallet para votar.
              </p>
              <div className="mt-4">
                <ConnectButton showBalance={false} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Link href="/voter/voting">
          <Button
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
            disabled={!isConnected}
          >
            <Vote className="mr-2 h-5 w-5" />
            Ir a Votar
          </Button>
        </Link>
        {!isConnected && (
          <p className="text-sm text-center text-yellow-600 mt-2">
            Conecta tu wallet para poder votar
          </p>
        )}
      </div>
    </div>
  );
}
