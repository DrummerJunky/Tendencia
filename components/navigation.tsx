"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useVoting } from "@/contexts/voting-context"
import { Button } from "@/components/ui/button"
import { Vote, LogOut, User, Shield, BarChart3 } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const { user, isAdmin, logout } = useVoting()

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Vote className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold">VotaSeguro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/leaderboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/leaderboard" ? "bg-blue-800" : "hover:bg-blue-800"
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Resultados
            </Link>

            {user && !isAdmin && (
              <>
                <Link
                  href="/voter/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/voter/profile" ? "bg-blue-800" : "hover:bg-blue-800"
                  }`}
                >
                  <User className="h-4 w-4 inline mr-1" />
                  Perfil
                </Link>
                <Link
                  href="/voter/voting"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/voter/voting" ? "bg-blue-800" : "hover:bg-blue-800"
                  }`}
                >
                  <Vote className="h-4 w-4 inline mr-1" />
                  Votar
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/admin/dashboard" ? "bg-blue-800" : "hover:bg-blue-800"
                }`}
              >
                <Shield className="h-4 w-4 inline mr-1" />
                Dashboard
              </Link>
            )}

            {user || isAdmin ? (
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-white text-blue-900 bg-white hover:bg-gray-100 hover:text-blue-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Salir
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-blue-900 bg-white hover:bg-gray-100 hover:text-blue-900"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
