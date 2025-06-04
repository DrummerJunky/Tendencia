"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()

  // Obtener el primer conector disponible (generalmente MetaMask)
  const connector = connectors[0]

  // Si está conectado, mostramos la dirección y botón de desconexión
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-blue-800 text-white text-xs px-3 py-1 rounded-full">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white text-blue-900 bg-white hover:bg-gray-100 hover:text-blue-900"
          onClick={() => disconnect()}
        >
          <LogOut className="h-4 w-4 mr-1" />
          Desconectar
        </Button>
      </div>
    )
  }

  // Si no está conectado, mostramos botón de conexión
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-white text-blue-900 bg-white hover:bg-gray-100 hover:text-blue-900"
      onClick={() => {
        if (connector) {
          connect({ connector })
        }
      }}
      disabled={!connector}
    >
      <Wallet className="h-4 w-4 mr-1" />
      {connector ? "Conectar Wallet" : "No hay wallet"}
    </Button>
  )
}
