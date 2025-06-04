import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, BarChart3, Users, Lock, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Vote className="h-20 w-20 mx-auto mb-6 text-red-300" />
            <h1 className="text-5xl font-bold mb-6">VotaSeguro</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Sistema de votación electrónica descentralizado basado en blockchain. Transparente, seguro y verificable
              para elecciones democráticas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                <Vote className="mr-2 h-5 w-5" />
                Votar Ahora
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 bg-blue-800"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Ver Resultados
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">¿Por qué VotaSeguro?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nuestra plataforma garantiza elecciones transparentes y seguras utilizando tecnología blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Lock className="h-12 w-12 text-blue-900 mx-auto mb-4" />
                <CardTitle className="text-blue-900">Seguridad Total</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Cada voto está protegido por criptografía blockchain, garantizando la integridad del proceso
                  electoral.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-red-600">Transparencia</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Todos los votos son verificables públicamente mientras se mantiene el anonimato del votante.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-blue-900 mx-auto mb-4" />
                <CardTitle className="text-blue-900">Resultados Inmediatos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Los resultados se actualizan en tiempo real y están disponibles inmediatamente después del voto.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Election Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Elecciones Generales 2024</h2>
            <p className="text-gray-600">Participa en las elecciones para elegir a tus representantes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-l-4 border-l-red-600">
              <CardHeader>
                <CardTitle className="text-red-600">Presidencial</CardTitle>
                <CardDescription>Elige al próximo presidente del país</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">3 candidatos registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="text-blue-600">Senatorial</CardTitle>
                <CardDescription>Elige a tus representantes en el Senado</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">3 candidatos registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-blue-900">
              <CardHeader>
                <CardTitle className="text-blue-900">Diputados</CardTitle>
                <CardDescription>Elige a tus diputados locales</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">3 candidatos registrados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Accede al Sistema</h2>
          <p className="text-lg mb-8 text-blue-100">
            Inicia sesión para participar en las elecciones o administrar el sistema
          </p>

          <div className="max-w-md mx-auto">
            <Card className="bg-white text-blue-900">
              <CardHeader>
                <Vote className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
                <CardDescription className="text-gray-600 text-lg">Accede como votante o administrador</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login">
                  <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg">
                    <Vote className="mr-2 h-6 w-6" />
                    Acceder al Sistema
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Conecta tu wallet para votar o usa credenciales de administrador
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
