"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Vote, Coins, CheckCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function VotingPage() {
  const { user, isAdmin, candidates, vote, isElectionActive } = useVoting()
  const router = useRouter()
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    if (!user || isAdmin) {
      router.push("/login")
    }
  }, [user, isAdmin, router])

  if (!user) {
    return <div>Cargando...</div>
  }

  const handleVoteClick = (candidate: any) => {
    if (user.votedCategories.includes(candidate.category) || user.tokensRemaining <= 0) {
      return
    }
    setSelectedCandidate(candidate)
    setShowConfirmDialog(true)
  }

  const confirmVote = async () => {
    if (!selectedCandidate) return

    setVoting(true)
    try {
      const success = await vote(selectedCandidate.id, selectedCandidate.category)
      if (success) {
        setShowConfirmDialog(false)
        setSelectedCandidate(null)
      }
    } catch (error) {
      console.error("Error al votar:", error)
    } finally {
      setVoting(false)
    }
  }

  const categoriesData = [
    { id: "presidencial", name: "Elección Presidencial", description: "Elige al próximo presidente" },
    { id: "senatorial", name: "Elección Senatorial", description: "Elige a tus senadores" },
    { id: "diputados", name: "Elección de Diputados", description: "Elige a tus diputados" },
  ]

  if (!isElectionActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Elecciones Cerradas</CardTitle>
            <CardDescription>Las elecciones no están activas en este momento</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Centro de Votación</h1>
              <p className="text-gray-600">Selecciona tus candidatos preferidos</p>
            </div>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Tokens restantes: {user.tokensRemaining}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Categorías de Votación */}
        <div className="space-y-8">
          {categoriesData.map((category) => {
            const categoryHasVoted = user.votedCategories.includes(category.id)
            const categoryCandidates = candidates.filter((c) => c.category === category.id)

            return (
              <Card key={category.id} className={`${categoryHasVoted ? "bg-green-50 border-green-200" : ""}`}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {category.name}
                        {categoryHasVoted && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    {categoryHasVoted && <Badge className="bg-green-100 text-green-800">✓ Votado</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {categoryCandidates.map((candidate) => (
                      <Card
                        key={candidate.id}
                        className={`transition-all hover:shadow-md ${
                          categoryHasVoted ? "opacity-60" : "hover:border-red-300"
                        }`}
                      >
                        <CardContent className="p-6 text-center">
                          <Image
                            src={candidate.image || "/placeholder.svg"}
                            alt={candidate.name}
                            width={80}
                            height={80}
                            className="rounded-full mx-auto mb-4"
                          />
                          <h3 className="font-bold text-lg mb-2">{candidate.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{candidate.party}</p>
                          <p className="text-xs text-gray-500 mb-4">Votos actuales: {candidate.votes}</p>
                          <Button
                            onClick={() => handleVoteClick(candidate)}
                            disabled={categoryHasVoted || user.tokensRemaining <= 0}
                            className={`w-full ${categoryHasVoted ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}`}
                          >
                            {categoryHasVoted ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Ya Votaste
                              </>
                            ) : (
                              <>
                                <Vote className="mr-2 h-4 w-4" />
                                Votar
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Diálogo de Confirmación */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Voto</DialogTitle>
              <DialogDescription>¿Estás seguro de que quieres votar por este candidato?</DialogDescription>
            </DialogHeader>

            {selectedCandidate && (
              <div className="py-4">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Image
                    src={selectedCandidate.image || "/placeholder.svg"}
                    alt={selectedCandidate.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-bold">{selectedCandidate.name}</h3>
                    <p className="text-sm text-gray-600">{selectedCandidate.party}</p>
                    <p className="text-xs text-gray-500">Categoría: {selectedCandidate.category}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Una vez confirmado, no podrás cambiar tu voto en esta categoría.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={voting}>
                Cancelar
              </Button>
              <Button onClick={confirmVote} disabled={voting} className="bg-red-600 hover:bg-red-700">
                {voting ? "Votando..." : "Confirmar Voto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
