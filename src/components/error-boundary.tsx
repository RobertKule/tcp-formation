"use client"

import { Lock } from "lucide-react"

export function ErrorFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FA]">
      <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Une erreur est survenue</h1>
        <p className="text-zinc-500">Impossible de charger les formations pour le moment. Veuillez réessayer plus tard.</p>
      </div>
    </main>
  )
}
