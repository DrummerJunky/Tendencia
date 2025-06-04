"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Wallet, Coins, CheckCircle, XCircle, Vote, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"

export default function VoterProfilePage() {
  const { user, isAdmin } = useVoting()
  const router = useRouter()
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!user || isAdmin) {
      router.push("/login")
    }
  }, [user, isAdmin, router])

  if (!user) {
    return <div>Cargando...</div>
  }

  const categories = [
    { id: "presidencial", name: "Presidencial", description: "Elección presidencial" },
    { id: "senatorial", name: "Senatorial", description: "Elección senatorial" },
    { id: "diputados", name: "Diputados", description: "Elección de diputados" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Perfil de Votante</h1>
          <p className="text-gray-600">Información de tu cuenta y estado de votación</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p className="text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ID de Votante</label>
                  <p className="text-lg font-mono">{user.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Información de Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-gray-700">Dirección de Wallet</label>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded mt-1 break-all">{user.walletAddress}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Wallet Conectada</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-700 font-medium">Wallet No Conectada</span>
                      <p className="text-sm text-gray-600 mt-2">
                        Conecta tu wallet para poder votar en las elecciones.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estado de Votación */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  Tokens de Voto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">{user.tokensRemaining}</div>
                  <p className="text-gray-600">Tokens restantes</p>
                  <p className="text-sm text-gray-500 mt-2">Cada token te permite votar en una categoría</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Votación</CardTitle>
                <CardDescription>Tu progreso en las elecciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => {
                  const hasVoted = user.votedCategories.includes(category.id)
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasVoted ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Votado
                            </Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-gray-400" />
                            <Badge variant="outline">Pendiente</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Link href="/voter/voting">
              <Button className="w-full bg-red-600 hover:bg-red-700" size="lg" disabled={!isConnected}>
                <Vote className="mr-2 h-5 w-5" />
                Ir a Votar
              </Button>
            </Link>
            {!isConnected && <p className="text-sm text-center text-yellow-600">Conecta tu wallet para poder votar</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
