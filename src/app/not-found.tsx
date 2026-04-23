"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo TCP */}
        <div className="mx-auto">
          <img 
            src="/LogoTCP.jpeg" 
            alt="TCP Formation Logo" 
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-[#0B1527]">404</h1>
          <h2 className="text-2xl font-semibold text-[#0B1527]">Page non trouvée</h2>
          <p className="text-zinc-600">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    </div>
  )
}
