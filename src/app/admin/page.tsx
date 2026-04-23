import { prisma } from "@/lib/prisma"
import { CandidateTable } from "@/components/admin/candidate-table"
import { FormationManager } from "@/components/admin/formation-manager"
import { AddCandidateDialog } from "@/components/admin/add-candidate-dialog"
import { CashBookManager } from "@/components/admin/cash-book-manager"
import { SettingsManager } from "@/components/admin/settings-manager"
import { type CashEntry } from "@prisma/client"

import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { LogOut, Users, BookOpen, TrendingUp, Wallet, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const candidates = await prisma.candidat.findMany({
    include: { 
      formation: true,
      payments: true 
    },
    orderBy: { createdAt: "desc" },
  })

  const formations = await prisma.formation.findMany({
    orderBy: { createdAt: "desc" },
  }) as any

  const entries = await (prisma as any).cashEntry.findMany({
    orderBy: { date: "desc" }
  })
  
  const totalRevenue = candidates.flatMap(c => c.payments || [])
    .filter(p => (p as any).statut === "APPROVED")
    .reduce((acc, p) => acc + (p.amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-zinc-200/60 bg-white/80 px-6 lg:px-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <img 
             src="/LogoTCP.jpeg" 
             alt="TCP Formation Logo" 
             className="h-10 w-auto object-contain"
           />
           <h1 className="text-xl font-bold tracking-tight text-[#0B1527]">Administration TCP</h1>
        </div>
        <div className="flex items-center gap-4">
          <form action={logout}>
            <Button type="submit" variant="ghost" className="text-zinc-500 hover:text-red-700 hover:bg-red-50 font-medium transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* KPI Card 1 */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 flex items-center space-x-4 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-medium text-zinc-500">Candidatures Totales</p>
               <p className="text-3xl font-bold text-[#0B1527]">{candidates.length}</p>
            </div>
          </div>
          
          {/* KPI Card 2 */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 flex items-center space-x-4 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-medium text-zinc-500">Formations Actives</p>
               <p className="text-3xl font-bold text-[#0B1527]">{formations.length}</p>
            </div>
          </div>

          {/* KPI Card 3 */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 flex items-center space-x-4 transition-transform hover:scale-[1.01]">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
               <p className="text-sm font-medium text-zinc-500">Paiements Validés</p>
               <p className="text-3xl font-bold text-[#0B1527]">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <Tabs defaultValue="candidatures" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-white/50 backdrop-blur-md rounded-2xl p-1 shadow-sm border border-white">
            <TabsTrigger value="candidatures" className="rounded-xl data-[state=active]:bg-[#0B1527] data-[state=active]:text-white transition-all">Candidats</TabsTrigger>
            <TabsTrigger value="formations" className="rounded-xl data-[state=active]:bg-[#0B1527] data-[state=active]:text-white transition-all">Formations</TabsTrigger>
            <TabsTrigger value="cash-book" className="rounded-xl data-[state=active]:bg-[#0B1527] data-[state=active]:text-white transition-all">Journal de Caisse</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-[#0B1527] data-[state=active]:text-white transition-all flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidatures">
            <section className="bg-white p-6 lg:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0B1527]">Candidatures récentes</h2>
                  <p className="text-zinc-500 text-sm mt-1">Gérez le suivi des inscrits et validez les paiements.</p>
                </div>
                <div className="shrink-0">
                   <AddCandidateDialog formations={formations} />
                </div>
              </div>
              
              <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                <CandidateTable candidates={candidates} />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="formations">
            <section className="bg-white p-6 lg:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0B1527]">Catalogue de Formations</h2>
                <p className="text-zinc-500 text-sm mt-1">Ajoutez ou modifiez les programmes disponibles.</p>
              </div>
              
              <div className="rounded-xl overflow-hidden">
                <FormationManager formations={formations} />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="cash-book" className="mt-6">
            <CashBookManager entries={entries as any} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsManager />
          </TabsContent>
        </Tabs>

      </main>
    </div>
  )
}
