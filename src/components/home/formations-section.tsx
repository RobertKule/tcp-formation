"use client"

import { Formation } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, DollarSign, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormationsSectionProps {
  formations: Formation[]
  onSelect: (id: string) => void
}

export function FormationsSection({ formations, onSelect }: FormationsSectionProps) {
  return (
    <section id="formations" className="py-16 bg-white border-y border-zinc-100">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-extrabold text-[#0B1527] mb-3 tracking-tight">TCP Administration : Nos Formations</h2>
          <p className="text-zinc-500 text-base leading-relaxed">
            Programmes intensifs conçus pour le marché de l'emploi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {formations.map((formation) => (
            <Card key={formation.id} className="group border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white flex flex-col">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md shadow-blue-100 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-[#0B1527] leading-tight mb-1">
                  {formation.nom}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 line-clamp-2 min-h-[2.5rem]">
                  {formation.description || "Formation pratique."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-zinc-600">
                    <Clock className="w-3.5 h-3.5 mr-2 text-blue-600" />
                    <span>{(formation as any).duree || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-xs font-bold text-blue-600">
                    <DollarSign className="w-3.5 h-3.5 mr-2" />
                    <span>{formation.prix.toLocaleString()}$ USD</span>
                  </div>
                </div>

                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelect(formation.id)
                    const formElement = document.getElementById('registration-card');
                    formElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full h-10 text-xs font-bold rounded-lg transition-all group-hover:bg-blue-600 group-hover:text-white"
                >
                  S'inscrire
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
