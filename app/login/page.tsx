"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Vote, Shield, Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"


export default function LoginPage() {
  const { isConnected } = useAccount()
  const [voterData, setVoterData] = useState({ name: "", email: "" })
  const [adminPassword, setAdminPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useVoting()
  const router = useRouter()

  const handleVoterLogin = async () => {
  if (!voterData.name || !voterData.email) {
    setError("Por favor completa todos los campos")
    return
  }

  if (!isConnected) {
    setError("Primero debes conectar tu wallet MetaMask")
    return
  }

  setLoading(true)
  setError("")

  try {
    const success = await login("voter", voterData)
    if (success) {
      router.push("/voter/profile")
    } else {
      setError("Error al iniciar sesión con la wallet")
    }
  } catch (err) {
    setError("Error de conexión")
  } finally {
    setLoading(false)
  }
}

  const handleAdminLogin = async () => {
    if (!adminPassword) {
      setError("Por favor ingresa la contraseña")
      return
    }

    setLoading(true)
    setError("")

    try {
      const success = await login("admin", { password: adminPassword })
      if (success) {
        router.push("/admin/dashboard")
      } else {
        setError("Contraseña incorrecta")
      }
    } catch (err) {
      setError("Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Vote className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-blue-900">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">Accede al sistema de votación VotaSeguro</p>
        </div>

        <Tabs defaultValue="voter" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voter" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Votante
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voter">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Wallet className="h-5 w-5" />
                  Acceso de Votante
                </CardTitle>
                <CardDescription>Ingresa las credenciales para participar en las elecciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    placeholder="Ingresa tu nombre completo"
                    value={voterData.name}
                    onChange={(e) => setVoterData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={voterData.email}
                    onChange={(e) => setVoterData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleVoterLogin} className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                  {loading ? "Conectando..." : "Iniciar Sesión"}
                </Button>

                <div className="text-sm text-gray-600 text-center">
                  <p>Se necesita conectar la wallet para continuar</p>
                  <p className="text-xs mt-1"></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Shield className="h-5 w-5" />
                  Acceso Administrativo
                </CardTitle>
                <CardDescription>Ingresa las credenciales de administrador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Contraseña de administrador"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleAdminLogin} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Verificando..." : "Iniciar Sesión"}
                </Button>

                <div className="text-sm text-gray-600 text-center">
                  <p className="text-xs">Contraseña = admin123</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
