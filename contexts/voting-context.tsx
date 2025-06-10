"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAccount, useConfig } from "wagmi"
import { readContract } from "@wagmi/core";
import { votingContract } from "@/lib/contratoinfo";

// 2) Define tu lista “estática” de candidatos (sin votos)


interface Candidate {
  id: string
  name: string
  party: string
  category: "presidencial" | "senatorial" | "diputados"
  votes: number
  image: string
}

const staticCandidates: Omit<Candidate, "votes">[] = [
    { id: "1", name: "Ana García",    party: "Partido Democrático", category: "presidencial", image: "/placeholder.svg" },
      { id: "2", name: "Carlos Mendoza", party: "Partido Liberal",      category: "presidencial", image: "/placeholder.svg" },
  { id: "3", name: "María López",    party: "Partido Conservador",  category: "presidencial", image: "/placeholder.svg" },
  { id: "4", name: "Roberto Silva",  party: "Partido Democrático", category: "senatorial",   image: "/placeholder.svg" },
  { id: "5", name: "Elena Vargas",   party: "Partido Liberal",      category: "senatorial",   image: "/placeholder.svg" },
  { id: "6", name: "Diego Ruiz",     party: "Partido Conservador",  category: "senatorial",   image: "/placeholder.svg" },
  { id: "7", name: "Laura Jiménez",  party: "Partido Democrático", category: "diputados",    image: "/placeholder.svg" },
  { id: "8", name: "Miguel Torres",  party: "Partido Liberal",      category: "diputados",    image: "/placeholder.svg" },
  { id: "9", name: "Carmen Flores",  party: "Partido Conservador",  category: "diputados",    image: "/placeholder.svg" }
  ];

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

interface RegisteredUser {
  id: string
  name: string
  email: string
  walletAddress: string
  tokensAssigned: number
  tokensUsed: number
  registrationDate: Date
  isActive: boolean
}

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
  updateProfile: (profile: Partial<VoterProfile>) => void
  toggleElection: () => void
  addCandidate: (candidate: Omit<Candidate, "id" | "votes">) => void
  updateCandidate: (id: string, updates: Partial<Candidate>) => void
  deleteCandidate: (id: string) => void
  assignTokensToUser: (userWalletAddress: string, tokens: number) => Promise<boolean>
  assignTokensToAllUsers: (tokens: number) => Promise<boolean>
  getUserByWallet: (walletAddress: string) => RegisteredUser | null
  registerUser: (userData: Omit<RegisteredUser, "id" | "registrationDate" | "tokensUsed">) => Promise<boolean>
  updateUserStatus: (walletAddress: string, isActive: boolean) => Promise<boolean>
}

const VotingContext = createContext<VotingContextType | undefined>(undefined)


// Mock de usuarios registrados
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
    registrationDate: new Date(Date.now() - 86400000), // 1 día atrás
    isActive: true,
  },
]

export function VotingProvider({ children }: { children: React.ReactNode }) {

  const { address, isConnected } = useAccount()
  const config = useConfig(); 

  const [user, setUser] = useState<VoterProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(mockRegisteredUsers)
  const [isElectionActive, setIsElectionActive] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])


  

  

useEffect(() => {
  if (address && isConnected && !isAdmin) {
    const registeredUser = registeredUsers.find(
      (u) => u.walletAddress.toLowerCase() === address.toLowerCase()
    );
    if (registeredUser && registeredUser.isActive && user) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              walletAddress: address,
              tokensRemaining:
                registeredUser.tokensAssigned - registeredUser.tokensUsed,
            }
          : null
      );
    }
  }
}, [address, isConnected, registeredUsers, user?.id, isAdmin]);  // ← cierra el useEffect aquí



 useEffect(() => {
  async function fetchVotes() {
    const updated = await Promise.all(
      staticCandidates.map(async (c) => {
        const bn = await readContract(
          config,
          {
            address: votingContract.address as `0x${string}`,
            abi: votingContract.abi,
            functionName: "getVotes",
            args: [c.name],
          }
        )
        return { ...c, votes: Number(bn) }
      })
    )
    setCandidates(updated)
  }
  fetchVotes()
}, [config])
 const login = async (type: "voter" | "admin", credentials?: any): Promise<boolean> => {
  if (type === "admin") {
    // tu lógica de admin sigue igual
    if (credentials?.password === "admin123") {
      setIsAdmin(true)
      return true
    }
    return false
  } else {
    // VOTANTE
    if (!address || !isConnected) return false

    const registeredUser = registeredUsers.find(
      u => u.walletAddress.toLowerCase() === address.toLowerCase()
    )

    // Si no estaba previamente registrado, rechazamos el login
    if (!registeredUser) {
      return false
    }

    if (!registeredUser.isActive) {
      return false
    }

    // Si llegó aquí, ya está todo OK: creamos el perfil en memoria
    const voterProfile: VoterProfile = {
      id: registeredUser.id,
      name: registeredUser.name,
      email: registeredUser.email,
      walletAddress: registeredUser.walletAddress,
      tokensRemaining: registeredUser.tokensAssigned - registeredUser.tokensUsed,
      votedCategories: [],
      voteHistory: [],
    }
    setUser(voterProfile)
    return true
  }
}
  const logout = () => {
    setUser(null)
    setIsAdmin(false)
  }

  const vote = async (candidateId: string, category: string): Promise<boolean> => {
    if (!user || user.tokensRemaining <= 0 || user.votedCategories.includes(category) || !isConnected) return false
    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate) return false
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, votes: c.votes + 1 } : c))
    const voteRecord: VoteRecord = {
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateParty: candidate.party,
      category,
      timestamp: new Date(),
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    }
    setUser(prev => prev ? {
      ...prev,
      tokensRemaining: prev.tokensRemaining - 1,
      votedCategories: [...prev.votedCategories, category],
      voteHistory: [...prev.voteHistory, voteRecord],
    } : null)
    setRegisteredUsers(prev => prev.map(regUser =>
      regUser.walletAddress.toLowerCase() === user.walletAddress.toLowerCase()
        ? { ...regUser, tokensUsed: regUser.tokensUsed + 1 }
        : regUser
    ))
    return true
  }

  const updateProfile = (profile: Partial<VoterProfile>) => {
    setUser(prev => prev ? { ...prev, ...profile } : null)
  }

  const toggleElection = () => setIsElectionActive(prev => !prev)

  const addCandidate = (candidateData: Omit<Candidate, "id" | "votes">) => {
    const newCandidate: Candidate = { ...candidateData, id: Date.now().toString(), votes: 0 }
    setCandidates(prev => [...prev, newCandidate])
  }

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id))
  }

  const assignTokensToUser = async (userWalletAddress: string, tokens: number): Promise<boolean> => {
    if (!isAdmin || tokens < 0) return false
    const userExists = registeredUsers.find(u => u.walletAddress.toLowerCase() === userWalletAddress.toLowerCase())
    if (!userExists) return false
    setRegisteredUsers(prev => prev.map(regUser =>
      regUser.walletAddress.toLowerCase() === userWalletAddress.toLowerCase()
        ? { ...regUser, tokensAssigned: regUser.tokensAssigned + tokens }
        : regUser
    ))
    if (user && user.walletAddress.toLowerCase() === userWalletAddress.toLowerCase()) {
      setUser(prev => prev ? { ...prev, tokensRemaining: prev.tokensRemaining + tokens } : null)
    }
    return true
  }

  const assignTokensToAllUsers = async (tokens: number): Promise<boolean> => {
    if (!isAdmin || tokens < 0) return false
    setRegisteredUsers(prev => prev.map(regUser =>
      regUser.isActive ? { ...regUser, tokensAssigned: regUser.tokensAssigned + tokens } : regUser
    ))
    if (user) {
      setUser(prev => prev ? { ...prev, tokensRemaining: prev.tokensRemaining + tokens } : null)
    }
    return true
  }

  const getUserByWallet = (walletAddress: string): RegisteredUser | null => {
    return registeredUsers.find(u => u.walletAddress.toLowerCase() === walletAddress.toLowerCase()) || null
  }

  const registerUser = async (userData: Omit<RegisteredUser, "id" | "registrationDate" | "tokensUsed">): Promise<boolean> => {
    if (!isAdmin) return false
    const existingUser = registeredUsers.find(u => u.walletAddress.toLowerCase() === userData.walletAddress.toLowerCase())
    if (existingUser) return false
    const newUser: RegisteredUser = {
      ...userData,
      id: Date.now().toString(),
      registrationDate: new Date(),
      tokensUsed: 0,
    }
    setRegisteredUsers(prev => [...prev, newUser])
    return true
  }

  const updateUserStatus = async (walletAddress: string, isActive: boolean): Promise<boolean> => {
    if (!isAdmin) return false
    setRegisteredUsers(prev => prev.map(regUser =>
      regUser.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        ? { ...regUser, isActive }
        : regUser
    ))
    if (!isActive && user && user.walletAddress.toLowerCase() === walletAddress.toLowerCase()) logout()
    return true
  }

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
        updateProfile,
        toggleElection,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        assignTokensToUser,
        assignTokensToAllUsers,
        getUserByWallet,
        registerUser,
        updateUserStatus,
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