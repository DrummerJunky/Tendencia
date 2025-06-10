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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Coins,
  UserPlus,
  Send,
  Wallet,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type Category = "presidencial" | "senatorial" | "diputados";


export default function AdminDashboardPage() {
  const {
    user,
    isAdmin,
    candidates,
    registeredUsers,
    isElectionActive,
    toggleElection,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    assignTokensToUser,
    assignTokensToAllUsers,
    updateUserStatus,
    registerUser,
  } = useVoting()
  const router = useRouter()
  const { toast } = useToast()

  // en app/admin/dashboard/page.tsx (o donde definas getCategoryStats)

const getCategoryStats = () => {
  const categories = ["presidencial", "senatorial", "diputados"] as const;
  return categories.map((category) => {
    const categoryCandidates = candidates.filter((c) => c.category === category);
    const totalVotes = categoryCandidates.reduce((sum, c) => sum + c.votes, 0);

    // Si no hay candidatos, devolvemos un líder por defecto
    const leaderName =
      categoryCandidates.length > 0
        ? categoryCandidates.reduce((prev, current) =>
            prev.votes > current.votes ? prev : current
          ).name
        : "—";

    return {
      category,
      totalVotes,
      leader: leaderName,
      candidates: categoryCandidates.length,
    };
  });
};

const categoryStats = getCategoryStats();

  // Estados para modales
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [showBulkTokenModal, setShowBulkTokenModal] = useState(false)
  const [showRegisterUserModal, setShowRegisterUserModal] = useState(false)

  // Estados para formularios
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<any>(null)
  const [selectedUserForTokens, setSelectedUserForTokens] = useState<string>("")
  const [tokensToAssign, setTokensToAssign] = useState<string>("")
  const [bulkTokens, setBulkTokens] = useState<string>("")
  
  const [candidateForm, setCandidateForm] = useState<{
  name: string;
  party: string;
  category: Category;
  image: string;
}>({
  name: "",
  party: "",
  category: "presidencial",
  image: "",
});

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    walletAddress: "",
    tokensAssigned: 0,
    isActive: true,
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

  const getTotalTokensAssigned = () => {
    return registeredUsers.reduce((sum, user) => sum + user.tokensAssigned, 0)
  }

  const getTotalTokensUsed = () => {
    return registeredUsers.reduce((sum, user) => sum + user.tokensUsed, 0)
  }

  const getActiveUsers = () => {
    return registeredUsers.filter(user => user.isActive).length
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

  // Funciones para manejo de tokens
  const handleAssignTokens = async () => {
    if (!selectedUserForTokens || !tokensToAssign) {
      toast({
        title: "Error",
        description: "Selecciona un usuario y especifica la cantidad de tokens",
        variant: "destructive",
      })
      return
    }

    const tokens = parseInt(tokensToAssign)
    if (tokens <= 0) {
      toast({
        title: "Error",
        description: "La cantidad de tokens debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    const success = await assignTokensToUser(selectedUserForTokens, tokens)
    if (success) {
      const user = registeredUsers.find(u => u.walletAddress === selectedUserForTokens)
      toast({
        title: "Tokens Asignados",
        description: `Se han asignado ${tokens} tokens a ${user?.name}`,
      })
      setShowTokenModal(false)
      setSelectedUserForTokens("")
      setTokensToAssign("")
    } else {
      toast({
        title: "Error",
        description: "No se pudieron asignar los tokens",
        variant: "destructive",
      })
    }
  }

  const handleBulkAssignTokens = async () => {
    if (!bulkTokens) {
      toast({
        title: "Error",
        description: "Especifica la cantidad de tokens",
        variant: "destructive",
      })
      return
    }

    const tokens = parseInt(bulkTokens)
    if (tokens <= 0) {
      toast({
        title: "Error",
        description: "La cantidad de tokens debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    const success = await assignTokensToAllUsers(tokens)
    if (success) {
      toast({
        title: "Tokens Asignados",
        description: `Se han asignado ${tokens} tokens a todos los usuarios activos`,
      })
      setShowBulkTokenModal(false)
      setBulkTokens("")
    } else {
      toast({
        title: "Error",
        description: "No se pudieron asignar los tokens",
        variant: "destructive",
      })
    }
  }

  const handleRegisterUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.walletAddress) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    const success = await registerUser(userForm)
    if (success) {
      toast({
        title: "Usuario Registrado",
        description: `${userForm.name} ha sido registrado exitosamente`,
      })
      setShowRegisterUserModal(false)
      setUserForm({
        name: "",
        email: "",
        walletAddress: "",
        tokensAssigned: 0,
        isActive: true,
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo registrar el usuario. Verifica que la wallet no esté ya registrada.",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = async (walletAddress: string, isActive: boolean) => {
    const success = await updateUserStatus(walletAddress, isActive)
    if (success) {
      const user = registeredUsers.find(u => u.walletAddress === walletAddress)
      toast({
        title: "Estado Actualizado",
        description: `${user?.name} ha sido ${isActive ? 'activado' : 'desactivado'}`,
      })
    }
  }

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
        <div className="grid md:grid-cols-5 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{getActiveUsers()}</div>
              <p className="text-xs text-muted-foreground">De {registeredUsers.length} registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Asignados</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{getTotalTokensAssigned()}</div>
              <p className="text-xs text-muted-foreground">{getTotalTokensUsed()} utilizados</p>
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

        {/* Tabs principales */}
        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="control">Control de Elecciones</TabsTrigger>
            <TabsTrigger value="tokens">Gestión de Usuarios</TabsTrigger>
            <TabsTrigger value="candidates">Candidatos</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Control de Elecciones */}
          <TabsContent value="control">
            <Card>
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
          </TabsContent>

          {/* Gestión de Tokens */}
          <TabsContent value="tokens">
            <div className="space-y-6">
              {/* Botones de acciones rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Gestión de Tokens de Votación
                  </CardTitle>
                  <CardDescription>Crear usuarios y administrar los tokens para la votación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button onClick={() => setShowTokenModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Send className="mr-2 h-4 w-4" />
                      Asignar a Usuario
                    </Button>
                    <Button onClick={() => setShowBulkTokenModal(true)} variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Asignar a Todos
                    </Button>
                    <Button onClick={() => setShowRegisterUserModal(true)} variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Registrar Usuario
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de usuarios */}
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios Registrados</CardTitle>
                  <CardDescription>Lista de todos los usuarios y su estado de tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Tokens Asignados</TableHead>
                        <TableHead>Tokens Usados</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registeredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs">
                              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.tokensAssigned}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.tokensUsed > 0 ? "default" : "secondary"}>
                              {user.tokensUsed}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                              {user.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserForTokens(user.walletAddress)
                                  setShowTokenModal(true)
                                }}
                              >
                                <Coins className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={user.isActive}
                                onCheckedChange={(checked) => handleToggleUserStatus(user.walletAddress, checked)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gestión de Candidatos */}
          <TabsContent value="candidates">
            <Card>
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
          </TabsContent>

          {/* Estadísticas */}
          <TabsContent value="stats">
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
          </TabsContent>
        </Tabs>

        {/* Modales */}
        
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

        {/* Modal de Asignar Tokens */}
<Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Asignar Tokens a Usuario</DialogTitle>
      <DialogDescription>
        Selecciona un usuario y especifica la cantidad de tokens a asignar para votación
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {/* Selector de usuario */}
      <div>
        <Label htmlFor="user">Usuario</Label>
        <Select
          value={selectedUserForTokens}
          onValueChange={setSelectedUserForTokens}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar usuario" />
          </SelectTrigger>
          <SelectContent>
            {registeredUsers.map((u) => (
              <SelectItem key={u.id} value={u.walletAddress}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campo de cantidad de tokens */}
      <div>
        <Label htmlFor="tokens">Cantidad de tokens</Label>
        <Input
          id="tokens"
          type="number"
          value={tokensToAssign}
          onChange={(e) => setTokensToAssign(e.target.value)}
          placeholder="0"
        />
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setShowTokenModal(false);
          setSelectedUserForTokens("");
          setTokensToAssign("");
        }}
      >
        Cancelar
      </Button>
      <Button onClick={handleAssignTokens}>
        Asignar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


{/* ——— Modal Añadir / Editar Candidato ——— */}
<Dialog open={showCandidateModal} onOpenChange={setShowCandidateModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {editingCandidate ? "Editar Candidato" : "Agregar Candidato"}
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {/* Nombre */}
      <div>
        <Label htmlFor="candidate-name">Nombre</Label>
        <Input
          id="candidate-name"
          value={candidateForm.name}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, name: e.target.value })
          }
        />
      </div>

      {/* Partido */}
      <div>
        <Label htmlFor="candidate-party">Partido</Label>
        <Input
          id="candidate-party"
          value={candidateForm.party}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, party: e.target.value })
          }
        />
      </div>

      {/* Categoría */}
      <div>
        <Label htmlFor="candidate-category">Categoría</Label>
        <Select
          value={candidateForm.category}
          onValueChange={(val) =>
            setCandidateForm({ ...candidateForm, category: val as Category })
          }
        >
          <SelectTrigger id="candidate-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presidencial">Presidencial</SelectItem>
            <SelectItem value="senatorial">Senatorial</SelectItem>
            <SelectItem value="diputados">Diputados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* URL de Imagen */}
      <div>
        <Label htmlFor="candidate-image">URL de Imagen</Label>
        <Input
          id="candidate-image"
          value={candidateForm.image}
          onChange={(e) =>
            setCandidateForm({ ...candidateForm, image: e.target.value })
          }
        />
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowCandidateModal(false)}
      >
        Cancelar
      </Button>
      <Button onClick={handleSaveCandidate}>
        {editingCandidate ? "Guardar cambios" : "Agregar candidato"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ——— Modal Confirmación de Eliminación ——— */}
<AlertDialog
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Eliminar candidato?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción es irreversible. ¿Seguro que quieres continuar?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDeleteCandidate}>
        Eliminar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

<Dialog open={showBulkTokenModal} onOpenChange={setShowBulkTokenModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Asignar Tokens a Todos</DialogTitle>
      <DialogDescription>
        Especifica la cantidad de tokens a asignar a todos los usuarios activos
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label htmlFor="bulk-tokens">Cantidad de tokens</Label>
        <Input
          id="bulk-tokens"
          type="number"
          value={bulkTokens}
          onChange={(e) => setBulkTokens(e.target.value)}
          placeholder="0"
        />
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setShowBulkTokenModal(false);
          setBulkTokens("");
        }}
      >
        Cancelar
      </Button>
      <Button onClick={handleBulkAssignTokens}>
        Asignar a Todos
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ——— Modal Registrar Usuario ——— */}
<Dialog open={showRegisterUserModal} onOpenChange={setShowRegisterUserModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
      <DialogDescription>
        Completa los datos del usuario para registrarlo en el sistema
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div>
        <Label htmlFor="user-name">Nombre</Label>
        <Input
          id="user-name"
          value={userForm.name}
          onChange={(e) =>
            setUserForm({ ...userForm, name: e.target.value })
          }
          placeholder="Juan Pérez"
        />
      </div>
      <div>
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={userForm.email}
          onChange={(e) =>
            setUserForm({ ...userForm, email: e.target.value })
          }
          placeholder="juan@example.com"
        />
      </div>
      <div>
        <Label htmlFor="user-wallet">Wallet Address</Label>
        <Input
          id="user-wallet"
          value={userForm.walletAddress}
          onChange={(e) =>
            setUserForm({ ...userForm, walletAddress: e.target.value })
          }
          placeholder="0x1234...789a"
        />
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setShowRegisterUserModal(false);
          setUserForm({ name: "", email: "", walletAddress: "", tokensAssigned: 0, isActive: true });
        }}
      >
        Cancelar
      </Button>
      <Button onClick={handleRegisterUser}>
        Registrar Usuario
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* cierra aquí tus dos <div> principales y el return */}
</div>
</div>
);
}
