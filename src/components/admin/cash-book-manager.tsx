"use client"

import { useState, useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import jsPDF from 'jspdf'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Calendar as CalendarIcon,
  FileText,
  FileSpreadsheet,
  BarChart3,
  X
} from "lucide-react"
import { type CashEntry } from "@prisma/client"
import { CashCharts } from "./cash-charts"
import { CashEntryDialog } from "./cash-entry-dialog"
import { CashEntryViewDialog } from "./cash-entry-view-dialog"
import { CashEntryDeleteDialog } from "./cash-entry-delete-dialog"
import { PrintReceiptButton } from "./print-receipt-button"

// Type étendu pour inclure le solde calculé dynamiquement
type ExtendedCashEntry = CashEntry & { calculatedBalance: number }

interface CashBookManagerProps {
  entries: CashEntry[]
}

export function CashBookManager({ entries }: CashBookManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [sortConfig, setSortConfig] = useState<{ key: keyof CashEntry; direction: "asc" | "desc" }>({ key: "date", direction: "desc" })
  
  // État pour le modal d'analyse journalière
  const [analysisDate, setAnalysisDate] = useState<Date | null>(null)

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR').replace(/[\s\u00A0]/g, ' ')
  }

  // --- LOGIQUE DE CALCUL ROBUSTE ---
  const filteredEntries = useMemo(() => {
    // 1. Tri chronologique de base (Date + Heure de création)
    const sortedChronologically = [...entries].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // 2. Calcul du solde progressif
    let runningBalance = 0;
    const entriesWithCalculatedBalance = sortedChronologically.map(entry => {
      if (entry.type === "ENTREE") runningBalance += entry.amount;
      else runningBalance -= entry.amount;
      return { ...entry, calculatedBalance: runningBalance };
    });

    // 3. Application des filtres
    const filtered = entriesWithCalculatedBalance.filter(entry => {
      const matchesSearch = entry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (entry.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      const matchesType = typeFilter === "ALL" || entry.type === typeFilter
      let matchesDateRange = true
      if (dateRange.from && dateRange.to) {
        const entryDate = new Date(entry.date)
        matchesDateRange = entryDate >= new Date(dateRange.from) && entryDate <= new Date(dateRange.to)
      }
      return matchesSearch && matchesType && matchesDateRange
    });

    // 4. Tri final pour l'affichage (Date décroissante par défaut)
    return filtered.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (sortConfig.key === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        const caA = new Date(a.createdAt).getTime();
        const caB = new Date(b.createdAt).getTime();
        return sortConfig.direction === "asc" ? caA - caB : caB - caA;
      }

      if (!valA || !valB) return 0;
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }) as ExtendedCashEntry[];
  }, [entries, searchTerm, typeFilter, dateRange, sortConfig]);

  const totalEntrees = entries.filter(e => e.type === "ENTREE").reduce((sum, e) => sum + e.amount, 0)
  const totalSorties = entries.filter(e => e.type === "SORTIE").reduce((sum, e) => sum + e.amount, 0)
  const currentBalance = totalEntrees - totalSorties

  const dailyEntries = useMemo(() => {
    if (!analysisDate) return []
    return filteredEntries.filter(e => isSameDay(new Date(e.date), analysisDate))
  }, [analysisDate, filteredEntries])

  const resetFilters = () => {
    setSearchTerm("")
    setTypeFilter("ALL")
    setDateRange({ from: "", to: "" })
  }

  const handleSort = (key: keyof CashEntry) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  // --- LOGIQUE D'EXPORTATION ---
  const generatePDFReport = (reportEntries: ExtendedCashEntry[]) => {
    const doc = new jsPDF()
    const margin = 20
    let y = margin

    doc.setFontSize(18); doc.text("Journal de Caisse TCP", margin, y); y += 15
    doc.setFontSize(10); doc.text(`Solde de clôture : ${formatCurrency(currentBalance)} $`, margin, y); y += 10
    
    // Simplification du tableau pour le PDF
    doc.setFontSize(9);
    reportEntries.forEach((e) => {
      if (y > 280) { doc.addPage(); y = 20 }
      const line = `${format(new Date(e.date), "dd/MM HH:mm")} | ${e.label.substring(0, 40)} | ${e.type === "ENTREE" ? "+" : "-"}${e.amount} | Solde: ${e.calculatedBalance}`;
      doc.text(line, margin, y);
      y += 7;
    });
    doc.save(`rapport-caisse.pdf`);
  }

  return (
    <div className="space-y-6 md:space-y-8 p-2 md:p-0 animate-in fade-in duration-700">
      
      {/* STATS : RESPONSIVE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-500 text-xs md:text-sm font-medium">Total Entrées</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900">{formatCurrency(totalEntrees)} $</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-500 text-xs md:text-sm font-medium">Total Sorties</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900">{formatCurrency(totalSorties)} $</p>
        </div>

        <div className="bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-100 sm:col-span-2 lg:col-span-1 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-1 text-blue-100">
            <span className="text-xs md:text-sm font-medium">Solde Actuel</span>
            <PlusCircle className="w-4 h-4" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(currentBalance)} $</p>
        </div>
      </div>

      {/* FILTRES & ACTIONS */}
      <div className="bg-white p-4 md:p-8 rounded-[1.5rem] shadow-sm border border-zinc-100 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10 h-11 rounded-xl border-zinc-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <CashEntryDialog />
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* CORRECTION ERREUR TYPESCRIPT ICI */}
            <Select 
              value={typeFilter} 
              onValueChange={(value) => setTypeFilter(value ?? "ALL")}
            >
              <SelectTrigger className="h-10 w-full md:w-[150px] rounded-xl">
                <Filter className="w-4 h-4 mr-2 text-zinc-400" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous types</SelectItem>
                <SelectItem value="ENTREE">Entrées</SelectItem>
                <SelectItem value="SORTIE">Sorties</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full md:w-auto">
               <Input type="date" className="h-10 rounded-xl" value={dateRange.from} onChange={(e) => setDateRange(p => ({...p, from: e.target.value}))} />
               <span className="text-zinc-400">/</span>
               <Input type="date" className="h-10 rounded-xl" value={dateRange.to} onChange={(e) => setDateRange(p => ({...p, to: e.target.value}))} />
            </div>

            <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="h-10 rounded-xl flex-1" onClick={() => generatePDFReport(filteredEntries)}>
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>
              <Button variant="outline" className="h-10 rounded-xl flex-1" onClick={() => resetFilters()}>
                <X className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>
          </div>
        </div>

        {/* TABLEAU : RESPONSIVE AVEC OVERFLOW */}
        <div className="rounded-xl border border-zinc-100 overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                  Date & Heure <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </TableHead>
                <TableHead className="hidden lg:table-cell">Compte</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="group hover:bg-zinc-50/50">
                  <TableCell className="text-xs md:text-sm whitespace-nowrap">
                    {format(new Date(entry.date), "dd/MM HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs font-mono text-zinc-400">
                    {entry.accountNumber || "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] md:max-w-xs">
                    <div className="truncate font-medium text-zinc-900" title={entry.label}>{entry.label}</div>
                  </TableCell>
                  <TableCell className={`text-right font-bold text-xs md:text-sm ${entry.type === "ENTREE" ? "text-green-600" : "text-red-600"}`}>
                    {entry.type === "ENTREE" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs md:text-sm text-zinc-600">
                    {formatCurrency(entry.calculatedBalance)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-blue-600" 
                        onClick={() => setAnalysisDate(new Date(entry.date))}
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <PrintReceiptButton data={{
                          type: "CAISSE",
                          nom: entry.label,
                          beneficiaire: (entry as any).beneficiary,
                          matricule: entry.accountNumber || undefined,
                          montant: entry.amount,
                          motif: entry.label,
                          date: new Date(entry.date),
                          modePaiement: entry.type === "ENTREE" ? "Encaissement" : "Décaissement"
                      }} />
                      <div className="hidden md:flex items-center">
                        <CashEntryViewDialog entry={entry} trigger={<Button size="icon" variant="ghost"><Eye className="w-4 h-4" /></Button>} />
                        <CashEntryDialog entry={entry} trigger={<Button size="icon" variant="ghost"><Pencil className="w-4 h-4" /></Button>} />
                        <CashEntryDeleteDialog entry={entry} trigger={<Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="w-4 h-4" /></Button>} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL ANALYSE JOURNALIERE */}
      <Dialog open={!!analysisDate} onOpenChange={(open) => !open && setAnalysisDate(null)}>
        <DialogContent className="max-w-4xl w-[95vw] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Analyse du {analysisDate && format(analysisDate, "dd MMMM yyyy", { locale: fr })}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="h-[300px] md:h-[400px] w-full">
              <CashCharts entries={dailyEntries} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* GRAPHIQUE GLOBAL */}
      <section className="bg-white p-4 md:p-8 rounded-[1.5rem] shadow-sm border border-zinc-100">
        <h2 className="text-xl font-bold mb-4">Flux de Trésorerie Global</h2>
        <div className="h-[300px] md:h-[400px]">
           <CashCharts entries={entries} />
        </div>
      </section>
    </div>
  )
}