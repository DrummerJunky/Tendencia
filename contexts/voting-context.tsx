// contexts/voting-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount, useConfig } from "wagmi";
import { readContract } from "@wagmi/core";
import { votingContract } from "@/lib/contratoinfo";

// 1) Lista estática inicial (sin votos)
const staticCandidates: Omit<Candidate, "votes">[] = [
  { id: "1", name: "Ana García", party: "Partido Democrático", category: "presidencial", image: "/placeholder.svg" },
  // … tus otros candidatos …
];

interface Candidate {
  id: string;
  name: string;
  party: string;
  category: "presidencial" | "senatorial" | "diputados";
  votes: number;
  image: string;
}

export interface VoteRecord {
  candidateId: string;
  candidateName: string;
  candidateParty: string;
  category: string;
  timestamp: Date;
  transactionHash: string;
}

export interface VoterProfile {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  tokensRemaining: number;
  votedCategories: string[];
  voteHistory: VoteRecord[];
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  tokensAssigned: number;
  tokensUsed: number;
  registrationDate: Date;
  isActive: boolean;
}

interface VotingContextType {
  user: VoterProfile | null;
  isAdmin: boolean;
  candidates: Candidate[];
  registeredUsers: RegisteredUser[];
  isElectionActive: boolean;
  isWalletConnected: boolean;
  login: (type: "voter" | "admin", credentials?: any) => Promise<boolean>;
  logout: () => void;
  vote: (candidateId: string, category: string) => Promise<boolean>;
  addCandidate: (c: Omit<Candidate, "id" | "votes">) => void;
  registerUser: (u: Omit<RegisteredUser, "id" | "registrationDate" | "tokensUsed">) => Promise<boolean>;
  assignTokensToUser: (wallet: string, tokens: number) => Promise<boolean>;
  assignTokensToAllUsers: (tokens: number) => Promise<boolean>;
  updateCandidate: (id: string, up: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  updateUserStatus: (wallet: string, active: boolean) => Promise<boolean>;
  toggleElection: () => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

// Lista mock (solo para primera carga)
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
  // …otros mocks…
];

export function VotingProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const config = useConfig();

  // Registered users con persistencia
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    if (typeof window === "undefined") return mockRegisteredUsers;
    const saved = localStorage.getItem("registeredUsers");
    return saved ? JSON.parse(saved) : mockRegisteredUsers;
  });

  // Candidatos con persistencia
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    if (typeof window === "undefined") return staticCandidates.map(c => ({ ...c, votes: 0 }));
    const saved = localStorage.getItem("candidates");
    return saved
      ? JSON.parse(saved)
      : staticCandidates.map(c => ({ ...c, votes: 0 }));
  });

  const [user, setUser] = useState<VoterProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isElectionActive, setIsElectionActive] = useState(true);

  // Volcar registeredUsers a localStorage
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Volcar candidatos a localStorage
  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("candidates", JSON.stringify(candidates));
  }, [candidates]);

  // Refrescar votos on-chain y mezclar sin borrar candidatos nuevos
  useEffect(() => {
    async function fetchVotes() {
      const onchain = await Promise.all(
        staticCandidates.map(async (c) => {
          const bn = await readContract(config, {
            address: votingContract.address as `0x${string}`,
            abi: votingContract.abi,
            functionName: "getVotes",
            args: [c.name],
          });
          return { ...c, votes: Number(bn) };
        })
      );
      setCandidates(prev => {
        // Actualizar votos existentes
        const updated = prev.map(c => {
          const o = onchain.find(x => x.id === c.id);
          return o ? { ...c, votes: o.votes } : c;
        });
        // Añadir candidatos on-chain nuevos (poco probable)
        const extras = onchain.filter(o => !updated.some(u => u.id === o.id));
        return [...updated, ...extras];
      });
    }
    fetchVotes();
  }, [config]);

  // Logout
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
  };

  // Login
  const login = async (
    type: "voter" | "admin",
    creds?: any
  ): Promise<boolean> => {
    if (type === "admin") {
      if (creds?.password === "admin123") {
        setIsAdmin(true);
        return true;
      }
      return false;
    }
    // voter branch
    if (!address || !isConnected) return false;
    const ru = registeredUsers.find(
      u => u.walletAddress.toLowerCase() === address.toLowerCase()
    );
    if (!ru || !ru.isActive) return false;
    setUser({
      id: ru.id,
      name: ru.name,
      email: ru.email,
      walletAddress: ru.walletAddress,
      tokensRemaining: ru.tokensAssigned - ru.tokensUsed,
      votedCategories: [],
      voteHistory: [],
    });
    return true;
  };

  // Votar off-chain
  const vote = async (candidateId: string, category: string) => {
    if (
      !user ||
      user.tokensRemaining <= 0 ||
      user.votedCategories.includes(category) ||
      !isConnected
    )
      return false;
    // Actualizar votos
    setCandidates(prev =>
      prev.map(c =>
        c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
      )
    );
    // Actualizar perfil y registeredUsers
    setUser(prev =>
      prev
        ? {
            ...prev,
            tokensRemaining: prev.tokensRemaining - 1,
            votedCategories: [...prev.votedCategories, category],
            voteHistory: [
              ...prev.voteHistory,
              {
                candidateId,
                candidateName: prev.voteHistory.length + 1 + "", // opcional
                candidateParty: "",
                category,
                timestamp: new Date(),
                transactionHash: "0x" + Math.random().toString(16).slice(2),
              },
            ],
          }
        : null
    );
    setRegisteredUsers(prev =>
      prev.map(u =>
        u.walletAddress.toLowerCase() === user.walletAddress.toLowerCase()
          ? { ...u, tokensUsed: u.tokensUsed + 1 }
          : u
      )
    );
    return true;
  };

  // CRUD candidatos
  const addCandidate = (data: Omit<Candidate, "id" | "votes">) => {
    setCandidates(prev => [
      ...prev,
      { ...data, id: Date.now().toString(), votes: 0 },
    ]);
  };
  const updateCandidate = (id: string, up: Partial<Candidate>) => {
    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, ...up } : c))
    );
  };
  const deleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  // Registrar usuario
  const registerUser = async (
    u: Omit<RegisteredUser, "id" | "registrationDate" | "tokensUsed">
  ): Promise<boolean> => {
    if (!isAdmin) return false;
    if (
      registeredUsers.some(
        x => x.walletAddress.toLowerCase() === u.walletAddress.toLowerCase()
      )
    )
      return false;
    setRegisteredUsers(prev => [
      ...prev,
      { ...u, id: Date.now().toString(), registrationDate: new Date(), tokensUsed: 0 },
    ]);
    return true;
  };

  // Asignar tokens a un usuario
  const assignTokensToUser = async (
    wallet: string,
    t: number
  ): Promise<boolean> => {
    if (!isAdmin || t <= 0) return false;
    setRegisteredUsers(prev =>
      prev.map(u =>
        u.walletAddress.toLowerCase() === wallet.toLowerCase()
          ? { ...u, tokensAssigned: u.tokensAssigned + t }
          : u
      )
    );
    // también actualiza al perfil si es el mismo
    if (user?.walletAddress.toLowerCase() === wallet.toLowerCase()) {
      setUser(prev =>
        prev ? { ...prev, tokensRemaining: prev.tokensRemaining + t } : prev
      );
    }
    return true;
  };

  // Asignar a todos
  const assignTokensToAllUsers = async (t: number) => {
    if (!isAdmin || t <= 0) return false;
    setRegisteredUsers(prev =>
      prev.map(u =>
        u.isActive ? { ...u, tokensAssigned: u.tokensAssigned + t } : u
      )
    );
    if (user) {
      setUser(prev =>
        prev ? { ...prev, tokensRemaining: prev.tokensRemaining + t } : prev
      );
    }
    return true;
  };

  // Activar/desactivar usuario
  const updateUserStatus = async (wallet: string, active: boolean) => {
    setRegisteredUsers(prev =>
      prev.map(u =>
        u.walletAddress.toLowerCase() === wallet.toLowerCase()
          ? { ...u, isActive: active }
          : u
      )
    );
    if (!active && user?.walletAddress === wallet) logout();
    return true;
  };

  const toggleElection = () => setIsElectionActive(x => !x);

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
  );
}

export function useVoting() {
  const ctx = useContext(VotingContext);
  if (!ctx) {
    throw new Error("useVoting must be used inside VotingProvider");
  }
  return ctx;
}
