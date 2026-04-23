"use client"

import { useState } from "react"
import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ChevronLeft, LockKeyhole } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] relative">
      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 font-medium bg-white/50 border border-transparent hover:bg-white hover:border-zinc-200 shadow-sm transition-all rounded-xl h-11 px-4">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="bg-white p-8 lg:p-10 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
            
            <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <LockKeyhole className="w-6 h-6" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#0B1527] mb-2">Espace Admin</h1>
              <p className="text-zinc-500 text-sm">
                Connectez-vous pour gérer les inscriptions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-600">Adresse Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@tcp.com"
                  required
                  className="h-12 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-blue-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-zinc-600">Mot de passe</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="h-12 bg-zinc-50 border-zinc-200 rounded-xl focus-visible:ring-blue-600"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 flex items-start">
                   <div className="mr-2 mt-0.5">•</div>
                   {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connexion...</>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
