// app/voter/voting/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVoting } from "@/contexts/voting-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useAccount,
  useBalance,
  useChainId,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { votingContract } from "@/lib/contratoinfo";
import Image from "next/image";
import { AlertCircle } from "lucide-react";

export default function VotingPage() {
  const {
    user,
    isAdmin,
    candidates,
    vote: voteOffChain,
    isElectionActive,
  } = useVoting();
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [votingTx, setVotingTx] = useState<string | null>(null);

  // Wagmi hooks
  const { isConnected, address } = useAccount();
  const { data: balanceData } = useBalance({ address });

  // chainId activo
  const chainId = useChainId();

  // switchChain
  const { switchChain } = useSwitchChain({
    mutation: {
      onError(error) {
        console.error("Error al cambiar de red:", error);
      },
    },
  });

  // writeContract
  const { writeContract, isPending: isVoting } = useWriteContract({
    mutation: {
      onSuccess(data) {
        setVotingTx(data);
        console.log("Voto registrado on-chain:", data);
      },
      onError(error) {
        console.error("Error al emitir voto on-chain:", error);
      },
    },
  });

  // Redirigir si no hay user o es admin
  useEffect(() => {
    if (!user || isAdmin) {
      router.push("/login");
    }
  }, [user, isAdmin, router]);

  // Forzar Sepolia
  useEffect(() => {
    if (isConnected && chainId && chainId !== 11155111) {
      switchChain({ chainId: 11155111 });
    }
  }, [isConnected, chainId, switchChain]);

  const handleVote = () => {
    // 1) sin tokens aborta
    if (!user?.tokensRemaining || user.tokensRemaining <= 0) {
      alert("No tienes tokens disponibles para votar");
      setShowConfirmDialog(false);
      return;
    }

    // 2) on-chain + off-chain
    if (selectedCandidate && isConnected && chainId === 11155111) {
      writeContract({
        address: votingContract.address as `0x${string}`,
        abi: votingContract.abi,
        functionName: "vote",
        args: [selectedCandidate.name],
      });
      voteOffChain(selectedCandidate.id, selectedCandidate.category);
    }

    // 3) cerrar diálogo
    setShowConfirmDialog(false);
  };

  if (!user) {
    return <div className="p-4">Cargando…</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vota por un candidato</h1>

      {/* Aviso red */}
      {isConnected && chainId && chainId !== 11155111 && (
        <div className="mb-4 flex items-center space-x-2 rounded-md bg-yellow-100 p-3 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          <span>
            Por favor cambia la red de tu wallet a <strong>Sepolia</strong>,{" "}
            actualmente estás en <strong>{chainId}</strong>.
          </span>
        </div>
      )}

      {/* Balance */}
      {isConnected && chainId === 11155111 && balanceData && (
        <div className="mb-4">
          <strong>Tu balance (Sepolia ETH):</strong> {balanceData.formatted}{" "}
          {balanceData.symbol}
        </div>
      )}

      {/* Lista de candidatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.map((candidate) => {
          const hasVotedOffChain = user.votedCategories.includes(candidate.category);

          return (
            <Card key={candidate.id}>
              <CardHeader>
                <CardTitle>{candidate.name}</CardTitle>
                <CardDescription>{candidate.party}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-2">
                  <Image
                    // ← fallback de src si es inválido
                    src={
                      typeof candidate.image === "string" && candidate.image
                        ? candidate.image
                        : "/placeholder.svg"
                    }
                    alt={candidate.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Votos off-chain: {candidate.votes}
                </p>
                <Button
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowConfirmDialog(true);
                  }}
                  disabled={
                    !isConnected ||
                    isVoting ||
                    chainId !== 11155111 ||
                    hasVotedOffChain
                  }
                  className={`${
                    !isConnected || chainId !== 11155111
                      ? "bg-gray-400 cursor-not-allowed"
                      : ""
                  } w-full`}
                >
                  {isVoting ? "Enviando..." : "Votar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar voto</DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas emitir tu voto para "{selectedCandidate?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleVote}>Confirmar y registrar on-chain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TxHash */}
      {votingTx && (
        <div className="mt-4 text-green-700">
          Voto enviado. TxHash: {votingTx}
        </div>
      )}
    </div>
  );
}
