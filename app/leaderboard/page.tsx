"use client"

import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Award } from "lucide-react"
import Image from "next/image"

export default function LeaderboardPage() {
  const { candidates } = useVoting()

  const categoriesData = [
    { id: "presidencial", name: "Elección Presidencial", icon: Award, color: "text-red-600" },
    { id: "senatorial", name: "Elección Senatorial", icon: TrendingUp, color: "text-blue-600" },
    { id: "diputados", name: "Elección de Diputados", icon: Users, color: "text-blue-900" },
  ]

  const getCategoryResults = (categoryId: string) => {
    const categoryCandidates = candidates.filter((c) => c.category === categoryId)
    const totalVotes = categoryCandidates.reduce((sum, c) => sum + c.votes, 0)

    return categoryCandidates
      .map((candidate) => ({
        ...candidate,
        percentage: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes)
  }

  const getTotalVotes = () => {
    return candidates.reduce((sum, c) => sum + c.votes, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BarChart3 className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Resultados en Tiempo Real</h1>
          <p className="text-gray-600 text-lg">Seguimiento transparente de los votos en blockchain</p>
          <div className="mt-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Total de votos: {getTotalVotes().toLocaleString()}
            </Badge>
          </div>
        </div>

        {/* Resultados por Categoría */}
        <div className="space-y-8">
          {categoriesData.map((category) => {
            const results = getCategoryResults(category.id)
            const totalCategoryVotes = results.reduce((sum, c) => sum + c.votes, 0)
            const IconComponent = category.icon

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-red-50">
                  <CardTitle className={`flex items-center gap-3 text-2xl ${category.color}`}>
                    <IconComponent className="h-8 w-8" />
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Total de votos: {totalCategoryVotes.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {results.map((candidate, index) => (
                      <div key={candidate.id} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-2xl font-bold ${
                                  index === 0
                                    ? "text-yellow-500"
                                    : index === 1
                                      ? "text-gray-400"
                                      : index === 2
                                        ? "text-orange-600"
                                        : "text-gray-600"
                                }`}
                              >
                                #{index + 1}
                              </span>
                              <Image
                                src={candidate.image || "/placeholder.svg"}
                                alt={candidate.name}
                                width={50}
                                height={50}
                                className="rounded-full"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{candidate.name}</h3>
                              <p className="text-gray-600">{candidate.party}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-900">{candidate.votes.toLocaleString()}</div>
                            <div className="text-lg text-gray-600">{candidate.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <Progress value={candidate.percentage} className="h-3" />
                        {index === 0 && (
                          <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white">Líder</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Información Adicional */}
        <Card className="mt-8 bg-gradient-to-r from-blue-900 to-red-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Transparencia Blockchain</h2>
            <p className="text-lg mb-4">
              Todos los votos son verificables y están registrados de forma inmutable en la blockchain
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">{getTotalVotes()}</div>
                <div className="text-sm">Votos Totales</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm">Transparencia</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm">Votos Fraudulentos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
