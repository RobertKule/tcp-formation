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
  BarChart3
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
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [sortConfig, setSortConfig] = useState<{ key: keyof CashEntry; direction: "asc" | "desc" }>({ key: "date", direction: "desc" })
  
  // État pour le modal d'analyse journalière
  const [analysisDate, setAnalysisDate] = useState<Date | null>(null)

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR').replace(/[\s\u00A0]/g, ' ')
  }

  // --- LOGIQUE DE CALCUL (CONSERVÉE CAR PARFAITE) ---
  const filteredEntries = useMemo(() => {
    const sortedChronologically = [...entries].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    let runningBalance = 0;
    const entriesWithCalculatedBalance = sortedChronologically.map(entry => {
      if (entry.type === "ENTREE") runningBalance += entry.amount;
      else runningBalance -= entry.amount;
      return { ...entry, calculatedBalance: runningBalance };
    });

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
      if (!valA || !valB) return 0
      return sortConfig.direction === "asc" ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });
  }, [entries, searchTerm, typeFilter, dateRange, sortConfig]);

  const totalEntrees = entries.filter(e => e.type === "ENTREE").reduce((sum, e) => sum + e.amount, 0)
  const totalSorties = entries.filter(e => e.type === "SORTIE").reduce((sum, e) => sum + e.amount, 0)
  const currentBalance = totalEntrees - totalSorties

  // Filtrer les entrées pour le modal d'analyse d'une journée spécifique
  const dailyEntries = useMemo(() => {
    if (!analysisDate) return []
    return filteredEntries.filter(e => isSameDay(new Date(e.date), analysisDate))
  }, [analysisDate, filteredEntries])

  const resetFilters = () => {
    setSearchTerm("")
    setTypeFilter("ALL")
    setDateRange({ from: "", to: "" })
  }

  const generatePDFReport = (reportEntries: (CashEntry & { calculatedBalance: number })[]) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = margin

    // En-tête
    doc.setFontSize(18); doc.setTextColor(0, 0, 0); doc.text("Rapport de Journal de Caisse", margin, y); y += 15
    doc.setFontSize(10); doc.text(`Généré le : ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}`, margin, y); y += 15

    // Résumé financier avec couleurs
    doc.setFontSize(11); doc.setFont("helvetica", "bold")
    doc.setTextColor(34, 139, 34); doc.text(`Total Entrées : ${formatCurrency(totalEntrees)} $`, margin, y); y += 6
    doc.setTextColor(178, 34, 34); doc.text(`Total Sorties : ${formatCurrency(totalSorties)} $`, margin, y); y += 6
    doc.setTextColor(0, 0, 139); doc.text(`Solde Actuel : ${formatCurrency(currentBalance)} $`, margin, y); y += 12

    // Tableau
    const headers = ["Date & Heure", "Libellé", "Type", "Montant", "Solde"]
    const colWidths = [35, 65, 20, 28, 22]
    let x = margin
    
    // Header background and border
    doc.setFillColor(240, 240, 240); doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F")
    doc.setDrawColor(200, 200, 200); doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "S")
    
    doc.setTextColor(0, 0, 0); doc.setFontSize(9)
    headers.forEach((h, i) => { doc.text(h, x + 2, y); x += colWidths[i] })
    y += 10; doc.setFont("helvetica", "normal")

    reportEntries.forEach((entry) => {
      if (y > 275) { doc.addPage(); y = margin + 10 }
      x = margin
      
      // Row border
      doc.setDrawColor(230, 230, 230); doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "S")

      const isEntree = entry.type === "ENTREE"
      
      // Date row
      doc.setTextColor(80, 80, 80); doc.text(format(new Date(entry.date), "dd/MM HH:mm"), x + 2, y); x += colWidths[0]
      
      // Label row
      doc.setTextColor(0, 0, 0); doc.text(entry.label.substring(0, 38), x + 2, y); x += colWidths[1]
      
      // Type row with color
      const typeColor = isEntree ? [34, 139, 34] : [178, 34, 34]
      doc.setTextColor(typeColor[0], typeColor[1], typeColor[2]); doc.text(entry.type, x + 2, y); x += colWidths[2]
      
      // Amount row with color
      doc.text(`${isEntree ? "+" : "-"}${formatCurrency(entry.amount)} $`, x + 2, y); x += colWidths[3]
      
      // Balance row
      doc.setTextColor(0, 0, 0); doc.text(`${formatCurrency(entry.calculatedBalance)} $`, x + 2, y)
      
      y += 8
    })

    doc.save(`rapport-caisse-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  const generateExcelReport = (reportEntries: (CashEntry & { calculatedBalance: number })[]) => {
    const headers = ["Date", "Heure", "Libellé", "Type", "Montant", "Solde"]
    const csvContent = [
      headers.join(","),
      ...reportEntries.map(e => [
        format(new Date(e.date), "dd/MM/yyyy"),
        format(new Date(e.date), "HH:mm"),
        `"${e.label.replace(/"/g, '""')}"`,
        e.type,
        e.amount,
        e.calculatedBalance
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport-caisse-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  return (
    <div className="space-y-6 md:space-y-8 p-2 md:p-0 animate-in fade-in duration-700">
      
      {/* Statistiques Responsives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-sm font-medium">Total Entrées</span>
            <TrendingUp className="w-5 h-5 text-green-600 bg-green-50 p-1 rounded" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900">{formatCurrency(totalEntrees)} $</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-500 text-sm font-medium">Total Sorties</span>
            <TrendingDown className="w-5 h-5 text-red-600 bg-red-50 p-1 rounded" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-zinc-900">{formatCurrency(totalSorties)} $</p>
        </div>

        <div className="bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Solde Actuel</span>
            <PlusCircle className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">{formatCurrency(currentBalance)} $</p>
        </div>
      </div>

      {/* Section Principale avec Filtres Responsives */}
      <div className="bg-white p-4 md:p-8 rounded-[1.5rem] shadow-sm border border-zinc-100 space-y-6">
        
        <div className="flex flex-col gap-4">
          {/* Recherche et Ajout */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10 h-11 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-zinc-400 hover:text-zinc-600"
                  onClick={() => setSearchTerm("")}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <CashEntryDialog />
          </div>

          {/* Filtres et Exports */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value ?? "ALL")}>
              <SelectTrigger className="h-10 w-full md:w-[140px] rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="ENTREE">Entrées</SelectItem>
                <SelectItem value="SORTIE">Sorties</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 w-full md:w-auto">
               <Input type="date" className="h-10 rounded-xl text-xs md:text-sm" value={dateRange.from} onChange={(e) => setDateRange(p => ({...p, from: e.target.value}))} />
               <span className="text-zinc-400">/</span>
               <Input type="date" className="h-10 rounded-xl text-xs md:text-sm" value={dateRange.to} onChange={(e) => setDateRange(p => ({...p, to: e.target.value}))} />
            </div>

            <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 border-zinc-200" 
                onClick={() => generatePDFReport(filteredEntries)}
              >
                <FileText className="w-4 h-4 mr-1 md:mr-2 text-zinc-500" /> PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 border-zinc-200" 
                onClick={() => generateExcelReport(filteredEntries)}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1 md:mr-2 text-zinc-500" /> Excel
              </Button>
              {(searchTerm || typeFilter !== "ALL" || dateRange.from || dateRange.to) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl h-10 text-zinc-500 hover:text-red-600 px-2"
                  onClick={resetFilters}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tableau Responsive */}
        <div className="rounded-xl border border-zinc-100 overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead className="w-[150px] whitespace-nowrap">Date & Heure</TableHead>
                <TableHead className="hidden lg:table-cell">Compte</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="group hover:bg-zinc-50/50">
                  <TableCell className="text-xs md:text-sm font-medium text-zinc-600">
                    {format(new Date(entry.date), "dd/MM HH:mm", { locale: fr })}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs font-mono text-zinc-400">
                    {entry.accountNumber || "-"}
                  </TableCell>
                  <TableCell className="max-w-[120px] md:max-w-xs">
                    <div className="truncate font-medium text-zinc-900" title={entry.label}>{entry.label}</div>
                  </TableCell>
                  <TableCell className={`text-right font-bold text-xs md:text-sm ${entry.type === "ENTREE" ? "text-green-600" : "text-red-600"}`}>
                    {entry.type === "ENTREE" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs md:text-sm text-zinc-600 bg-zinc-50/30">
                    {formatCurrency((entry as any).calculatedBalance)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      {/* BOUTON ANALYSE JOURNALIÈRE */}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => setAnalysisDate(new Date(entry.date))}
                        title="Analyse graphique du jour"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
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

                        <div className="hidden md:flex items-center gap-1">
                          <CashEntryViewDialog 
                            entry={entry} 
                            trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-blue-600"><Eye className="w-4 h-4" /></Button>} 
                          />
                          <CashEntryDialog 
                            entry={entry} 
                            trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></Button>} 
                          />
                          <CashEntryDeleteDialog 
                            entry={entry} 
                            trigger={<Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>} 
                          />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL D'ANALYSE JOURNALIÈRE */}
      <Dialog open={!!analysisDate} onOpenChange={(open) => !open && setAnalysisDate(null)}>
        <DialogContent className="max-w-4xl w-[95vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Analyse du {analysisDate && format(analysisDate, "dd MMMM yyyy", { locale: fr })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <div className="h-[300px] md:h-[400px] w-full">
              {/* On réutilise le composant graphique en lui passant uniquement les données du jour */}
              <CashCharts entries={dailyEntries} />
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600 font-medium uppercase">Entrées du jour</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(dailyEntries.filter(e => e.type === "ENTREE").reduce((s, e) => s + e.amount, 0))} $
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-xs text-red-600 font-medium uppercase">Sorties du jour</p>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(dailyEntries.filter(e => e.type === "SORTIE").reduce((s, e) => s + e.amount, 0))} $
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Graphique Global Bas de page */}
      <section className="bg-white p-4 md:p-8 rounded-[1.5rem] shadow-sm border border-zinc-100">
        <h2 className="text-xl font-bold text-zinc-900 mb-4">Evolution globale</h2>
        <div className="h-[300px] md:h-[400px]">
           <CashCharts entries={entries} />
        </div>
      </section>
    </div>
  )
}