"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface Candidate {
  id: string
  name: string
  party: string
  category: "presidencial" | "senatorial" | "diputados"
  votes: number
  image: string
}

interface VoteRecord {
  candidateId: string
  candidateName: string
  candidateParty: string
  category: string
  timestamp: Date
  transactionHash: string
}

interface VoterProfile {
  id: string
  name: string
  email: string
  walletAddress: string
  tokensRemaining: number
  votedCategories: string[]
  voteHistory: VoteRecord[]
}

interface VotingContextType {
  user: VoterProfile | null
  isAdmin: boolean
  candidates: Candidate[]
  isElectionActive: boolean
  login: (type: "voter" | "admin", credentials?: any) => Promise<boolean>
  logout: () => void
  vote: (candidateId: string, category: string) => Promise<boolean>
  updateProfile: (profile: Partial<VoterProfile>) => void
  toggleElection: () => void
  addCandidate: (candidate: Omit<Candidate, "id" | "votes">) => void
  updateCandidate: (id: string, updates: Partial<Candidate>) => void
  deleteCandidate: (id: string) => void
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)

const mockCandidates: Candidate[] = [
  // Presidencial
  {
    id: "1",
    name: "Ana García",
    party: "Partido Democrático",
    category: "presidencial",
    votes: 1250,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    party: "Partido Liberal",
    category: "presidencial",
    votes: 980,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "María López",
    party: "Partido Conservador",
    category: "presidencial",
    votes: 1100,
    image: "/placeholder.svg?height=100&width=100",
  },

  // Senatorial
  {
    id: "4",
    name: "Roberto Silva",
    party: "Partido Democrático",
    category: "senatorial",
    votes: 850,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "5",
    name: "Elena Vargas",
    party: "Partido Liberal",
    category: "senatorial",
    votes: 920,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "6",
    name: "Diego Ruiz",
    party: "Partido Conservador",
    category: "senatorial",
    votes: 780,
    image: "/placeholder.svg?height=100&width=100",
  },

  // Diputados
  {
    id: "7",
    name: "Laura Jiménez",
    party: "Partido Democrático",
    category: "diputados",
    votes: 650,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "8",
    name: "Miguel Torres",
    party: "Partido Liberal",
    category: "diputados",
    votes: 720,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "9",
    name: "Carmen Flores",
    party: "Partido Conservador",
    category: "diputados",
    votes: 580,
    image: "/placeholder.svg?height=100&width=100",
  },
]

export function VotingProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<VoterProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates)
  const [isElectionActive, setIsElectionActive] = useState(true)

  const login = async (type: "voter" | "admin", credentials?: any): Promise<boolean> => {
    if (type === "admin") {
      if (credentials?.password === "admin123") {
        setIsAdmin(true)
        return true
      }
      return false
    } else {
      // Simular conexión con wallet
      const mockUser: VoterProfile = {
        id: "1",
        name: credentials?.name || "Usuario Demo",
        email: credentials?.email || "demo@example.com",
        walletAddress: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        tokensRemaining: 3,
        votedCategories: [],
        voteHistory: [],
      }
      setUser(mockUser)
      return true
    }
  }

  const logout = () => {
    setUser(null)
    setIsAdmin(false)
  }

  const vote = async (candidateId: string, category: string): Promise<boolean> => {
    if (!user || user.tokensRemaining <= 0 || user.votedCategories.includes(category)) {
      return false
    }

    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate) return false

    // Actualizar votos del candidato
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === candidateId ? { ...candidate, votes: candidate.votes + 1 } : candidate,
      ),
    )

    // Crear registro de voto
    const voteRecord: VoteRecord = {
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateParty: candidate.party,
      category: category,
      timestamp: new Date(),
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Hash simulado
    }

    // Actualizar usuario
    setUser((prev) =>
      prev
        ? {
            ...prev,
            tokensRemaining: prev.tokensRemaining - 1,
            votedCategories: [...prev.votedCategories, category],
            voteHistory: [...prev.voteHistory, voteRecord],
          }
        : null,
    )

    return true
  }

  const updateProfile = (profile: Partial<VoterProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : null))
  }

  const toggleElection = () => {
    setIsElectionActive((prev) => !prev)
  }

  const addCandidate = (candidateData: Omit<Candidate, "id" | "votes">) => {
    const newCandidate: Candidate = {
      ...candidateData,
      id: Date.now().toString(),
      votes: 0,
    }
    setCandidates((prev) => [...prev, newCandidate])
  }

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((candidate) => (candidate.id === id ? { ...candidate, ...updates } : candidate)))
  }

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id))
  }

  return (
    <VotingContext.Provider
      value={{
        user,
        isAdmin,
        candidates,
        isElectionActive,
        login,
        logout,
        vote,
        updateProfile,
        toggleElection,
        addCandidate,
        updateCandidate,
        deleteCandidate,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

export function useVoting() {
  const context = useContext(VotingContext)
  if (context === undefined) {
    throw new Error("useVoting must be used within a VotingProvider")
  }
  return context
}
