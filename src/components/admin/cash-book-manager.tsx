"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  PlusCircle, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Pencil, 
  Eye,
  ArrowUpDown,
  Filter,
  Calendar as CalendarIcon
} from "lucide-react"
import { type CashEntry } from "@prisma/client"
import { CashCharts } from "./cash-charts"
import { CashEntryDialog } from "./cash-entry-dialog"
import { CashEntryViewDialog } from "./cash-entry-view-dialog"
import { CashEntryDeleteDialog } from "./cash-entry-delete-dialog"
import { PrintReceiptButton } from "./print-receipt-button"

interface CashBookManagerProps {
  entries: CashEntry[]
}

export function CashBookManager({ entries }: CashBookManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [sortConfig, setSortConfig] = useState<{ key: keyof CashEntry; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc"
  })

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const matchesSearch = entry.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (entry.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        const matchesType = typeFilter === "ALL" || entry.type === typeFilter
        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        const valA = a[sortConfig.key]
        const valB = b[sortConfig.key]
        
        if (!valA || !valB) return 0
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
  }, [entries, searchTerm, typeFilter, sortConfig])
  const handleSort = (key: keyof CashEntry) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }))
  }


  const totalEntrees = entries.filter(e => e.type === "ENTREE").reduce((sum, e) => sum + e.amount, 0)
  const totalSorties = entries.filter(e => e.type === "SORTIE").reduce((sum, e) => sum + e.amount, 0)
  const currentBalance = totalEntrees - totalSorties

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm font-medium">Total Entrées</span>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">${totalEntrees.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm font-medium">Total Sorties</span>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">${totalSorties.toLocaleString()}</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl border border-blue-500 shadow-lg shadow-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-blue-100 text-sm font-medium">Solde Actuel</span>
            <div className="p-2 bg-blue-500/50 rounded-lg">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">${currentBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Rechercher par libellé ou compte..." 
              className="pl-10 h-11 border-zinc-200 rounded-xl focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
              <SelectTrigger className="h-11 w-[150px] border-zinc-200 rounded-xl">
                <Filter className="w-4 h-4 mr-2 text-zinc-400" />
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous types</SelectItem>
                <SelectItem value="ENTREE">Entrées</SelectItem>
                <SelectItem value="SORTIE">Sorties</SelectItem>
              </SelectContent>
            </Select>
            <CashEntryDialog />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                  <div className="flex items-center">Date <ArrowUpDown className="ml-2 w-3 h-3" /></div>
                </TableHead>
                <TableHead>Compte</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort("amount")}>
                  <div className="flex items-center justify-end">Montant <ArrowUpDown className="ml-2 w-3 h-3" /></div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <TableCell className="font-medium text-zinc-600">
                    {format(new Date(entry.date), "dd/MM/yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs font-mono">{entry.accountNumber || "-"}</TableCell>
                  <TableCell className="font-semibold text-zinc-900">{entry.label}</TableCell>
                  <TableCell className={`text-right font-bold ${entry.type === "ENTREE" ? "text-green-600" : "text-red-600"}`}>
                    {entry.type === "ENTREE" ? "+" : "-"}${entry.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={entry.type === "ENTREE" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}>
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-zinc-500">
                    ${entry.balance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PrintReceiptButton data={{
                        type: "CAISSE",
                        nom: entry.label,
                        beneficiaire: (entry as any).beneficiary || undefined,
                        matricule: entry.accountNumber || undefined,
                        montant: entry.amount,
                        motif: entry.label,
                        date: new Date(entry.date),
                        modePaiement: entry.type === "ENTREE" ? "Encaissement" : "Décaissement"
                      }} />
                      
                      <CashEntryViewDialog 
                        entry={entry}
                        trigger={
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        }
                      />

                      <CashEntryDialog 
                        entry={entry}
                        trigger={
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-blue-600">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        }
                      />

                      <CashEntryDeleteDialog 
                        entry={entry}
                        trigger={
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-zinc-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-400">
                    Aucune donnée trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Graphics Section */}
      <section className="bg-white p-6 lg:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1527]">Flux de Trésorerie</h2>
          <p className="text-zinc-500 text-sm mt-1">Visualisez l'évolution des entrées et sorties sur la période.</p>
        </div>
        <div className="h-[400px] w-full">
           <CashCharts entries={entries} />
        </div>
      </section>
    </div>
  )
}
