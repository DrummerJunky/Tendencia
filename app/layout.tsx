import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import { Navigation } from "@/components/navigation"    // <-- importa tu nav

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Navigation />        {/* <-- monta tu nav aquí */}
          {children}
        </Providers>
      </body>
    </html>
  )
}