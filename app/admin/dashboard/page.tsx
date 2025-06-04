"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useVoting } from "@/contexts/voting-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Shield,
  Users,
  Vote,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AdminDashboardPage() {
  const {
    user,
    isAdmin,
    candidates,
    isElectionActive,
    toggleElection,
    addCandidate,
    updateCandidate,
    deleteCandidate,
  } = useVoting()
  const router = useRouter()
  const { toast } = useToast()

  // Estados para modales
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Estados para formularios
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<any>(null)
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    category: "presidencial" as "presidencial" | "senatorial" | "diputados",
    image: "",
  })

  useEffect(() => {
    if (!isAdmin) {
      router.push("/login")
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return <div>Cargando...</div>
  }

  const getTotalVotes = () => {
    return candidates.reduce((sum, c) => sum + c.votes, 0)
  }

  const getCategoryStats = () => {
    const categories = ["presidencial", "senatorial", "diputados"]
    return categories.map((category) => {
      const categoryCandidates = candidates.filter((c) => c.category === category)
      const totalVotes = categoryCandidates.reduce((sum, c) => sum + c.votes, 0)
      const leader = categoryCandidates.reduce((prev, current) => (prev.votes > current.votes ? prev : current))

      return {
        category,
        totalVotes,
        leader: leader.name,
        candidates: categoryCandidates.length,
      }
    })
  }

  const handleScheduleClose = () => {
    if (!scheduleDate || !scheduleTime) {
      toast({
        title: "Error",
        description: "Por favor selecciona fecha y hora",
        variant: "destructive",
      })
      return
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      toast({
        title: "Error",
        description: "La fecha debe ser futura",
        variant: "destructive",
      })
      return
    }

    // Simular programación del cierre
    toast({
      title: "Cierre Programado",
      description: `Las elecciones se cerrarán automáticamente el ${scheduledDateTime.toLocaleString()}`,
    })

    setShowScheduleModal(false)
    setScheduleDate("")
    setScheduleTime("")
  }

  const handleAddCandidate = () => {
    setEditingCandidate(null)
    setCandidateForm({
      name: "",
      party: "",
      category: "presidencial",
      image: "",
    })
    setShowCandidateModal(true)
  }

  const handleEditCandidate = (candidate: any) => {
    setEditingCandidate(candidate)
    setCandidateForm({
      name: candidate.name,
      party: candidate.party,
      category: candidate.category,
      image: candidate.image,
    })
    setShowCandidateModal(true)
  }

  const handleSaveCandidate = () => {
    if (!candidateForm.name || !candidateForm.party) {
      toast({
        title: "Error",
        description: "Nombre y partido son obligatorios",
        variant: "destructive",
      })
      return
    }

    if (editingCandidate) {
      updateCandidate(editingCandidate.id, candidateForm)
      toast({
        title: "Candidato Actualizado",
        description: `${candidateForm.name} ha sido actualizado exitosamente`,
      })
    } else {
      addCandidate(candidateForm)
      toast({
        title: "Candidato Agregado",
        description: `${candidateForm.name} ha sido agregado exitosamente`,
      })
    }

    setShowCandidateModal(false)
    setCandidateForm({
      name: "",
      party: "",
      category: "presidencial",
      image: "",
    })
    setEditingCandidate(null)
  }

  const handleDeleteCandidate = (candidateId: string) => {
    setCandidateToDelete(candidateId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteCandidate = () => {
    if (candidateToDelete) {
      const candidate = candidates.find((c) => c.id === candidateToDelete)
      deleteCandidate(candidateToDelete)
      toast({
        title: "Candidato Eliminado",
        description: `${candidate?.name} ha sido eliminado exitosamente`,
      })
    }
    setShowDeleteDialog(false)
    setCandidateToDelete(null)
  }

  const categoryStats = getCategoryStats()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600">Panel de control del sistema de votación</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estado de Elecciones:</span>
                <Switch checked={isElectionActive} onCheckedChange={toggleElection} />
                <Badge variant={isElectionActive ? "default" : "secondary"}>
                  {isElectionActive ? "Activas" : "Cerradas"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Votos</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{getTotalVotes()}</div>
              <p className="text-xs text-muted-foreground">Votos registrados en blockchain</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{candidates.length}</div>
              <p className="text-xs text-muted-foreground">Candidatos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">3</div>
              <p className="text-xs text-muted-foreground">Elecciones simultáneas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado Sistema</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Operativo</span>
              </div>
              <p className="text-xs text-muted-foreground">Blockchain sincronizada</p>
            </CardContent>
          </Card>
        </div>

        {/* Control de Elecciones */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Control de Elecciones
            </CardTitle>
            <CardDescription>Administra el estado y configuración de las elecciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Estado de Votación</h3>
                    <p className="text-sm text-gray-600">
                      {isElectionActive ? "Las elecciones están activas" : "Las elecciones están cerradas"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isElectionActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <Switch checked={isElectionActive} onCheckedChange={toggleElection} />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Acciones Rápidas</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Programar Cierre Automático
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowCandidateModal(true)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Administrar Candidatos
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Información del Sistema</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Última sincronización:</span>
                      <span className="font-medium">Hace 2 minutos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bloques confirmados:</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hash del último bloque:</span>
                      <span className="font-mono text-xs">0x742d35...3b8D4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Candidatos */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gestión de Candidatos</CardTitle>
                <CardDescription>Administra los candidatos registrados en el sistema</CardDescription>
              </div>
              <Button onClick={handleAddCandidate} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Candidato
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Partido</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Votos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="flex items-center gap-3">
                      <Image
                        src={candidate.image || "/placeholder.svg"}
                        alt={candidate.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <span className="font-medium">{candidate.name}</span>
                    </TableCell>
                    <TableCell>{candidate.party}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {candidate.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{candidate.votes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCandidate(candidate)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Estadísticas por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas por Categoría</CardTitle>
            <CardDescription>Resumen de votos y líderes por cada categoría electoral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg capitalize">{stat.category}</h3>
                    <Badge variant="outline">{stat.totalVotes} votos</Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-blue-900">{stat.totalVotes}</div>
                      <div className="text-sm text-gray-600">Total de Votos</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-green-600">{stat.leader}</div>
                      <div className="text-sm text-gray-600">Candidato Líder</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">{stat.candidates}</div>
                      <div className="text-sm text-gray-600">Candidatos</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Programar Cierre */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Programar Cierre Automático</DialogTitle>
              <DialogDescription>
                Configura la fecha y hora para cerrar automáticamente las elecciones
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Fecha de Cierre</Label>
                <Input id="date" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="time">Hora de Cierre</Label>
                <Input id="time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleScheduleClose}>Programar Cierre</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Candidatos */}
        <Dialog open={showCandidateModal} onOpenChange={setShowCandidateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCandidate ? "Editar Candidato" : "Agregar Candidato"}</DialogTitle>
              <DialogDescription>
                {editingCandidate
                  ? "Modifica la información del candidato"
                  : "Ingresa la información del nuevo candidato"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del candidato"
                />
              </div>
              <div>
                <Label htmlFor="party">Partido Político</Label>
                <Input
                  id="party"
                  value={candidateForm.party}
                  onChange={(e) => setCandidateForm((prev) => ({ ...prev, party: e.target.value }))}
                  placeholder="Nombre del partido"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={candidateForm.category}
                  onValueChange={(value: "presidencial" | "senatorial" | "diputados") =>
                    setCandidateForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presidencial">Presidencial</SelectItem>
                    <SelectItem value="senatorial">Senatorial</SelectItem>
                    <SelectItem value="diputados">Diputados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">URL de Imagen (opcional)</Label>
                <Input
                  id="image"
                  value={candidateForm.image}
                  onChange={(e) => setCandidateForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCandidateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCandidate}>{editingCandidate ? "Actualizar" : "Agregar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmación de Eliminación */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El candidato será eliminado permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCandidate}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
