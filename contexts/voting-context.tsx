// contexts/voting-context.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAccount, useConfig } from "wagmi"
import { readContract } from "@wagmi/core"
import { votingContract } from "@/lib/contratoinfo"

// 1) Lista estática para inicializar (sin votos)
const staticCandidates: Omit<Candidate, "votes">[] = [
  { id: "1", name: "Ana García",    party: "Partido Democrático", category: "presidencial", image: "/placeholder.svg" },
      { id: "2", name: "Carlos Mendoza", party: "Partido Liberal",      category: "presidencial", image: "/placeholder.svg" },
  { id: "3", name: "María López",    party: "Partido Conservador",  category: "presidencial", image: "/placeholder.svg" },
  { id: "4", name: "Roberto Silva",  party: "Partido Democrático", category: "senatorial",   image: "/placeholder.svg" },
  { id: "5", name: "Elena Vargas",   party: "Partido Liberal",      category: "senatorial",   image: "/placeholder.svg" },
  { id: "6", name: "Diego Ruiz",     party: "Partido Conservador",  category: "senatorial",   image: "/placeholder.svg" },
  { id: "7", name: "Laura Jiménez",  party: "Partido Democrático", category: "diputados",    image: "/placeholder.svg" },
  { id: "8", name: "Miguel Torres",  party: "Partido Liberal",      category: "diputados",    image: "/placeholder.svg" },
  { id: "9", name: "Carmen Flores",  party: "Partido Conservador",  category: "diputados",    image: "/placeholder.svg" }
]

interface Candidate {
  id: string
  name: string
  party: string
  category: "presidencial" | "senatorial" | "diputados"
  votes: number
  image: string
}

export interface VoteRecord {
  candidateId: string
  candidateName: string
  candidateParty: string
  category: string
  timestamp: Date
  transactionHash: string
}

export interface VoterProfile {
  id: string
  name: string
  email: string
  walletAddress: string
  tokensRemaining: number
  votedCategories: string[]
  voteHistory: VoteRecord[]
}

export interface RegisteredUser {
  id: string
  name: string
  email: string
  walletAddress: string
  tokensAssigned: number
  tokensUsed: number
  registrationDate: Date
  isActive: boolean
}



// ——————————————————————————————————————————————————
// 2) Mock inicial de usuarios (antes de usarlo en useState)
// ——————————————————————————————————————————————————
const mockRegisteredUsers: RegisteredUser[] = [
  {
    id: "1",
    name: "Usuario Demo",
    email: "demo@example.com",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    tokensAssigned: 0,
    tokensUsed: 0,
    registrationDate: new Date(),
    isActive: true,
  },
  {
    id: "2",
    name: "Juan Pérez",
    email: "juan@example.com",
    walletAddress: "0x123456789abcdef123456789abcdef123456789a",
    tokensAssigned: 0,
    tokensUsed: 0,
    registrationDate: new Date(Date.now() - 86400000),
    isActive: true,
  },
]

// ——————————————————————————————————————————————————
// 3) Lista estática de candidatos (sin votos)
// ——————————————————————————————————————————————————


// ——————————————————————————————————————————————————
// 4) Contexto y proveedor
// ——————————————————————————————————————————————————
interface VotingContextType {
  user: VoterProfile | null
  isAdmin: boolean
  candidates: Candidate[]
  registeredUsers: RegisteredUser[]
  isElectionActive: boolean
  isWalletConnected: boolean
  login: (type: "voter" | "admin", credentials?: any) => Promise<boolean>
  logout: () => void
  vote: (candidateId: string, category: string) => Promise<boolean>
  addCandidate: (c: Omit<Candidate, "id" | "votes">) => void
  registerUser: (u: Omit<RegisteredUser, "id" | "registrationDate" | "tokensUsed">) => Promise<boolean>
  assignTokensToUser: (wallet: string, tokens: number) => Promise<boolean>
  assignTokensToAllUsers: (tokens: number) => Promise<boolean>
  updateCandidate: (id: string, up: Partial<Candidate>) => void
  deleteCandidate: (id: string) => void
  updateUserStatus: (wallet: string, active: boolean) => Promise<boolean>
  toggleElection: () => void
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)

export function VotingProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const config = useConfig()

  // 4.1) Usuarios con persistencia
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    if (typeof window === "undefined") return mockRegisteredUsers
    const saved = localStorage.getItem("registeredUsers")
    return saved ? JSON.parse(saved) : mockRegisteredUsers
  })

  // 4.2) Candidatos con persistencia
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    if (typeof window === "undefined") return staticCandidates.map(c => ({ ...c, votes: 0 }))
    const saved = localStorage.getItem("candidates")
    return saved ? JSON.parse(saved) : staticCandidates.map(c => ({ ...c, votes: 0 }))
  })

  const [user, setUser] = useState<VoterProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isElectionActive, setIsElectionActive] = useState(true)

  const logout = () => {
    setUser(null)
    setIsAdmin(false)
  }

  // 5) Sync a localStorage
  useEffect(() => {
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
  }, [registeredUsers])
  useEffect(() => {
    localStorage.setItem("candidates", JSON.stringify(candidates))
  }, [candidates])

  // 6) refrescar votos on-chain
  useEffect(() => {
    ;(async () => {
      const onchain = await Promise.all(
        staticCandidates.map(async (c) => {
          const bn = await readContract(config, {
            address: votingContract.address as `0x${string}`,
            abi: votingContract.abi,
            functionName: "getVotes",
            args: [c.name],
          })
          return { ...c, votes: Number(bn) }
        })
      )
      setCandidates(prev => {
        const updated = prev.map(c => {
          const o = onchain.find(x => x.id === c.id)
          return o ? { ...c, votes: o.votes } : c
        })
        const extras = onchain.filter(o => !updated.some(u => u.id === o.id))
        return [...updated, ...extras]
      })
    })()
  }, [config])

  // 7) login
  const login = async (type: "voter" | "admin", creds?: any) => {
    if (type === "admin") {
      if (creds?.password === "admin123") {
        setIsAdmin(true)
        return true
      }
      return false
    }
    if (!address || !isConnected) return false
    const ru = registeredUsers.find(u => u.walletAddress.toLowerCase() === address.toLowerCase())
    if (!ru || !ru.isActive) return false
    setUser({
      id: ru.id,
      name: ru.name,
      email: ru.email,
      walletAddress: ru.walletAddress,
      tokensRemaining: ru.tokensAssigned - ru.tokensUsed,
      votedCategories: [],
      voteHistory: [],
    })
    return true
  }

  // 8) vote off-chain + on-chain
  const vote = async (candidateId: string, category: string) => {
    /* tu lógica aquí… */
    return true
  }

  // 9) crud candidatos
  const addCandidate = (data: Omit<Candidate, "id" | "votes">) =>
    setCandidates(prev => [...prev, { ...data, id: Date.now().toString(), votes: 0 }])
  const updateCandidate = (id: string, up: Partial<Candidate>) =>
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...up } : c))
  const deleteCandidate = (id: string) =>
    setCandidates(prev => prev.filter(c => c.id !== id))

  // 10) registrar usuario
  const registerUser = async (u: Omit<RegisteredUser, "id" | "registrationDate" | "tokensUsed">) => {
    if (!isAdmin) return false
    if (registeredUsers.some(x => x.walletAddress.toLowerCase() === u.walletAddress.toLowerCase()))
      return false
    setRegisteredUsers(prev => [
      ...prev,
      { ...u, id: Date.now().toString(), registrationDate: new Date(), tokensUsed: 0 }
    ])
    return true
  }

  // 11) tokens & status…
  const assignTokensToUser = async (_: string, __: number) => true
  const assignTokensToAllUsers = async (_: number) => true
  const updateUserStatus = async (_: string, __: boolean) => { logout(); return true }

  const toggleElection = () => setIsElectionActive(x => !x)

  return (
    <VotingContext.Provider
      value={{
        user,
        isAdmin,
        candidates,
        registeredUsers,
        isElectionActive,
        isWalletConnected: isConnected,
        login,
        logout,
        vote,
        addCandidate,
        registerUser,
        assignTokensToUser,
        assignTokensToAllUsers,
        updateCandidate,
        deleteCandidate,
        updateUserStatus,
        toggleElection,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

// 12) hook de consumo
export function useVoting() {
  const ctx = useContext(VotingContext)
  if (!ctx) throw new Error("useVoting debe usarse dentro de VotingProvider")
  return ctx
}
