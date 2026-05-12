"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import jsPDF from 'jspdf'
import Image from 'next/image'
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
  Calendar as CalendarIcon,
  FileText,
  FileSpreadsheet
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
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: ""
  })
  const [sortConfig, setSortConfig] = useState<{ key: keyof CashEntry; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc"
  })

  // Fonction pour formater les nombres correctement
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR').replace(/[\s\u00A0]/g, ' ')
  }

  const filteredEntries = useMemo(() => {
    return entries
      .filter(entry => {
        const matchesSearch = entry.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (entry.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        const matchesType = typeFilter === "ALL" || entry.type === typeFilter
        
        // Filtrage par plage de dates
        let matchesDateRange = true
        if (dateRange.from && dateRange.to) {
          const entryDate = new Date(entry.date)
          const fromDate = new Date(dateRange.from)
          const toDate = new Date(dateRange.to)
          matchesDateRange = entryDate >= fromDate && entryDate <= toDate
        } else if (dateRange.from) {
          const entryDate = new Date(entry.date)
          const fromDate = new Date(dateRange.from)
          matchesDateRange = entryDate >= fromDate
        } else if (dateRange.to) {
          const entryDate = new Date(entry.date)
          const toDate = new Date(dateRange.to)
          matchesDateRange = entryDate <= toDate
        }
        
        return matchesSearch && matchesType && matchesDateRange
      })
      .sort((a, b) => {
        const valA = a[sortConfig.key]
        const valB = b[sortConfig.key]
        
        if (!valA || !valB) return 0
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
  }, [entries, searchTerm, typeFilter, dateRange, sortConfig])
  const handleSort = (key: keyof CashEntry) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  const generatePDFReport = (entries: CashEntry[]) => {
    // Créer un nouveau document PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin
    
    // Couleurs personnalisées
    const primaryColor = [59, 130, 246] // blue-500
    const successColor = [34, 197, 94] // green-500
    const dangerColor = [239, 68, 68] // red-500
    const grayColor = [107, 114, 128] // gray-500
    
    // Ajouter le logo en haut à gauche
    try {
      // Charger le logo comme une URL
      const logoUrl = '/LogoTCP.jpeg'
      doc.addImage(logoUrl, 'JPEG', margin, margin, 35, 25)
    } catch (error) {
      console.log('Erreur lors de l\'ajout du logo:', error)
      // Ajouter un texte de remplacement si le logo ne fonctionne pas
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text('TCP', margin, margin + 15)
    }
    
    // Titre du rapport avec couleur
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('Rapport de Journal de Caisse', pageWidth / 2, yPosition + 10, { align: 'center' })
    yPosition += 25
    
    // Cadre pour les informations générales
    doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
    doc.setFillColor(249, 250, 251) // gray-50
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'FD')
    
    // Informations générales
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Informations générales', margin + 5, yPosition + 8)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Période: ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`, margin + 5, yPosition + 18)
    doc.text(`Nombre d'entrées: ${entries.length}`, margin + 5, yPosition + 28)
    yPosition += 45
    
    // Cadre pour le résumé financier avec couleurs
    doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 50, 3, 3, 'FD')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Résumé financier', margin + 5, yPosition + 10)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    
    // Total Entrées en vert
    doc.setTextColor(successColor[0], successColor[1], successColor[2])
    doc.text(`Total Entrées: ${formatCurrency(totalEntrees)} $`, margin + 5, yPosition + 25)
    
    // Total Sorties en rouge
    doc.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2])
    doc.text(`Total Sorties: ${formatCurrency(totalSorties)} $`, margin + 5, yPosition + 35)
    
    // Solde Actuel en bleu
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setFont('helvetica', 'bold')
    doc.text(`Solde Actuel: ${formatCurrency(currentBalance)} $`, margin + 5, yPosition + 45)
    
    yPosition += 60
    
    // En-tête du tableau
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Détail des transactions', margin, yPosition)
    yPosition += 15
    
    // En-têtes du tableau avec fond coloré
    const headers = ['Date', 'Compte', 'Libellé', 'Type', 'Montant', 'Solde']
    const columnWidths = [25, 25, 45, 20, 30, 25]
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0)
    const startX = (pageWidth - tableWidth) / 2
    
    // Fond pour les en-têtes
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(startX, yPosition - 5, tableWidth, 10, 2, 2, 'F')
    
    // Texte des en-têtes en blanc
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    let xPos = startX
    
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, yPosition)
      xPos += columnWidths[index]
    })
    yPosition += 8
    
    // Bordure du tableau
    doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
    doc.rect(startX, yPosition - 13, tableWidth, 8, 'S')
    
    // Données du tableau avec alternance de couleurs
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    
    entries.forEach((entry, index) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin + 20
        
        // Répéter les en-têtes sur la nouvelle page
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.roundedRect(startX, yPosition - 5, tableWidth, 10, 2, 2, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        xPos = startX
        headers.forEach((header, index) => {
          doc.text(header, xPos + 2, yPosition)
          xPos += columnWidths[index]
        })
        yPosition += 8
        doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
        doc.rect(startX, yPosition - 13, tableWidth, 8, 'S')
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
      }
      
      // Fond alterné pour les lignes
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251)
        doc.rect(startX, yPosition - 2, tableWidth, 8, 'F')
      }
      
      xPos = startX
      const rowData = [
        format(new Date(entry.date), "dd/MM/yyyy", { locale: fr }),
        entry.accountNumber || "-",
        entry.label,
        entry.type,
        `${entry.type === "ENTREE" ? "+" : ""}${formatCurrency(entry.amount)} $`,
        `${formatCurrency(entry.balance)} $`
      ]
      
      let additionalHeight = 0 // Déclarer ici pour être accessible après la boucle
      
      // Couleur pour le type et le montant
      rowData.forEach((data, colIndex) => {
        if (colIndex === 3) { // Type
          const color = entry.type === "ENTREE" ? successColor : dangerColor
          doc.setTextColor(color[0], color[1], color[2])
          doc.setFont('helvetica', 'bold')
        } else if (colIndex === 4) { // Montant
          const color = entry.type === "ENTREE" ? successColor : dangerColor
          doc.setTextColor(color[0], color[1], color[2])
        } else {
          doc.setTextColor(0, 0, 0)
          doc.setFont('helvetica', 'normal')
        }
        
        // Gérer le retour à la ligne pour le libellé (colonne 2)
        if (colIndex === 2 && data.length > 25) {
          const words = data.split(' ')
          let line = ''
          let currentY = yPosition + 5
          let linesCount = 1
          
          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' '
            if (testLine.length > 25) {
              if (line !== '') {
                doc.text(line.trim(), xPos + 2, currentY)
                line = words[i] + ' '
                currentY += 5
                linesCount++
              } else {
                // Mot trop long, le couper
                doc.text(words[i].substring(0, 22) + '...', xPos + 2, currentY)
                line = ''
                currentY += 5
                linesCount++
              }
            } else {
              line = testLine
            }
          }
          if (line !== '') {
            doc.text(line.trim(), xPos + 2, currentY)
          }
          
          // Calculer la hauteur supplémentaire nécessaire
          additionalHeight = (linesCount - 1) * 5
        } else {
          doc.text(data, xPos + 2, yPosition + 5)
        }
        
        xPos += columnWidths[colIndex]
      })
      
      // Ajouter les bordures verticales pour chaque colonne
      doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
      doc.setLineWidth(0.3)
      
      // Bordure gauche de la ligne
      doc.line(startX, yPosition - 2, startX, yPosition + 6 + additionalHeight)
      
      // Bordures entre les colonnes
      let borderX = startX
      for (let i = 0; i < columnWidths.length - 1; i++) {
        borderX += columnWidths[i]
        doc.line(borderX, yPosition - 2, borderX, yPosition + 6 + additionalHeight)
      }
      
      // Bordure droite de la ligne
      doc.line(startX + tableWidth, yPosition - 2, startX + tableWidth, yPosition + 6 + additionalHeight)
      
      // Bordure inférieure de la ligne
      doc.line(startX, yPosition + 6 + additionalHeight, startX + tableWidth, yPosition + 6 + additionalHeight)
      
      // Ajuster la hauteur de la ligne selon le contenu
      yPosition += 8 + additionalHeight
    })
    
    // Pied de page avec bordure
    const footerY = pageHeight - 20
    doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2])
    doc.setLineWidth(0.5)
    doc.line(margin, footerY, pageWidth - margin, footerY)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2])
    doc.text(`Généré le: ${format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: fr })}`, margin, footerY + 10)
    doc.text('Page 1 sur 1', pageWidth - margin - 30, footerY + 10)
    
    // Télécharger le PDF
    doc.save(`rapport-caisse-${format(new Date(), "yyyy-MM-dd")}.pdf`)
  }

  const generateExcelReport = (entries: CashEntry[]) => {
    // Créer le contenu CSV (format compatible Excel)
    const headers = ["Date", "Compte", "Libellé", "Type", "Montant", "Solde"]
    const csvContent = [
      headers.join(","),
      ...entries.map(entry => [
        format(new Date(entry.date), "dd/MM/yyyy", { locale: fr }),
        entry.accountNumber || "",
        `"${entry.label.replace(/"/g, '""')}"`, // Échapper les guillemets
        entry.type,
        entry.amount,
        entry.balance
      ].join(","))
    ].join("\n")

    // Ajouter le résumé à la fin
    const summary = [
      "",
      "RÉSUMÉ",
      "Total Entrées," + totalEntrees,
      "Total Sorties," + totalSorties,
      "Solde Actuel," + currentBalance
    ].join("\n")

    const finalContent = csvContent + summary

    // Créer un Blob et télécharger
    const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport-caisse-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalEntrees)} $</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm font-medium">Total Sorties</span>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalSorties)} $</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl border border-blue-500 shadow-lg shadow-blue-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-blue-100 text-sm font-medium">Solde Actuel</span>
            <div className="p-2 bg-blue-500/50 rounded-lg">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(currentBalance)} $</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-zinc-100 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Rechercher par libellé ou compte..." 
              className="pl-10 h-11 border-zinc-200 rounded-xl focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtre par plage de dates */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="date"
                  placeholder="Du..."
                  className="pl-10 h-11 w-[140px] border-zinc-200 rounded-xl focus:ring-blue-500/20"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <span className="text-zinc-400 text-sm">au</span>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="date"
                  placeholder="Au..."
                  className="pl-10 h-11 w-[140px] border-zinc-200 rounded-xl focus:ring-blue-500/20"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
              {(dateRange.from || dateRange.to) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 px-3 text-zinc-400 hover:text-red-600"
                  onClick={() => setDateRange({ from: "", to: "" })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-11 px-3 border-zinc-200 rounded-xl hover:bg-zinc-50"
              onClick={() => handleSort("date")}
            >
              <CalendarIcon className="w-4 h-4 mr-2 text-zinc-600" />
              Tri par date
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-11 px-4 border-zinc-200 rounded-xl hover:bg-zinc-50"
              onClick={() => generatePDFReport(filteredEntries)}
            >
              <FileText className="w-4 h-4 mr-2 text-zinc-600" />
              Rapport PDF (trié)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-11 px-4 border-zinc-200 rounded-xl hover:bg-zinc-50"
              onClick={() => generateExcelReport(filteredEntries)}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-zinc-600" />
              Rapport Excel (trié)
            </Button>
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
                  <TableCell className="font-semibold text-zinc-900 max-w-xs align-top">
                    <div className="break-words whitespace-normal leading-relaxed">
                      {entry.label}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-bold ${entry.type === "ENTREE" ? "text-green-600" : "text-red-600"}`}>
                    {entry.type === "ENTREE" ? "+" : ""}{formatCurrency(entry.amount)} $
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={entry.type === "ENTREE" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}>
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-zinc-500">
                    {formatCurrency(entry.balance)} $
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
