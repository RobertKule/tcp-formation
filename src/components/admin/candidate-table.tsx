"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateCandidateStatus } from "@/lib/actions/candidate"
import { Candidat, Formation, Payment } from "@prisma/client"
import { Check, X, Loader2, History, ArrowUpDown, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaymentProgress } from "./payment-progress"
import { PaymentHistory } from "./payment-history"
import { AddPaymentDialog } from "./add-payment-dialog"
import { CANDIDATE_STATUS } from "@/lib/constants"

export type CandidateWithAll = Candidat & {
  formation: Formation
  payments: Payment[]
}

export function CandidateTable({ candidates }: { candidates: CandidateWithAll[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: "nom" | "formation" | "statut", direction: "asc" | "desc" } | null>(null)

  const handleStatusUpdate = async (id: string, status: "REJECTED" | "PENDING") => {
    setLoadingId(id)
    const res = await updateCandidateStatus(id, status)
    setLoadingId(null)
    if (res.success) {
      toast.success(status === "REJECTED" ? "Candidature rejetée" : "Statut mis à jour")
    } else {
      toast.error(res.error)
    }
  }

  const handleSort = (key: "nom" | "formation" | "statut") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (!sortConfig) return 0
    if (sortConfig.key === "nom") {
      return sortConfig.direction === "asc" ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
    }
    if (sortConfig.key === "formation") {
      return sortConfig.direction === "asc" ? a.formation.nom.localeCompare(b.formation.nom) : b.formation.nom.localeCompare(a.formation.nom)
    }
    if (sortConfig.key === "statut") {
      return sortConfig.direction === "asc" ? a.statut.localeCompare(b.statut) : b.statut.localeCompare(a.statut)
    }
    return 0
  })

  const renderSortIcon = (columnKey: "nom" | "formation" | "statut") => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-400 inline-block" />
    return sortConfig.direction === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-800 inline-block" /> 
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-800 inline-block" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case CANDIDATE_STATUS.FULLY_PAID:
        return <Badge className="bg-green-500 hover:bg-green-600">Payé</Badge>
      case CANDIDATE_STATUS.PARTIALLY_PAID:
        return <Badge className="bg-blue-500 hover:bg-blue-600">Partiel</Badge>
      case CANDIDATE_STATUS.REJECTED:
        return <Badge variant="destructive">Rejeté</Badge>
      default:
        return <Badge variant="outline">En Attente</Badge>
    }
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-zinc-50">
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-zinc-100 transition-colors whitespace-nowrap" onClick={() => handleSort("nom")}>
               <div className="flex items-center">Candidat {renderSortIcon("nom")}</div>
            </TableHead>
            <TableHead className="cursor-pointer hover:bg-zinc-100 transition-colors whitespace-nowrap" onClick={() => handleSort("formation")}>
               <div className="flex items-center">Formation {renderSortIcon("formation")}</div>
            </TableHead>
            <TableHead>Progression Paiement</TableHead>
            <TableHead className="cursor-pointer hover:bg-zinc-100 transition-colors whitespace-nowrap" onClick={() => handleSort("statut")}>
               <div className="flex items-center">Statut {renderSortIcon("statut")}</div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                Aucun candidat trouvé.
              </TableCell>
            </TableRow>
          ) : (
            sortedCandidates.map((candidate) => {
              const totalPaid = candidate.payments.reduce((sum, p) => sum + p.amount, 0)
              const remaining = candidate.formation.prix - totalPaid
              
              // Find the most recent capture uploaded by the user to display inline
              const latestCapture = candidate.payments.filter(p => p.captureUrl).sort((a,b) => new Date(b.datePayment).getTime() - new Date(a.datePayment).getTime())[0]

              return (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="font-medium text-zinc-900">{candidate.nom} {candidate.postnom}</div>
                    <div className="text-xs text-muted-foreground">{candidate.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{candidate.formation.nom}</div>
                    <div className="text-xs text-muted-foreground">{candidate.formation.prix} $</div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <PaymentProgress totalPaid={totalPaid} totalPrice={candidate.formation.prix} />
                  </TableCell>
                  <TableCell>{getStatusBadge(candidate.statut)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {latestCapture && (
                        <a href={latestCapture.captureUrl!} target="_blank" title="Voir la preuve d'upload">
                          <Button variant="ghost" size="icon-sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </a>
                      )}

                      <Dialog>
                        <DialogTrigger render={
                          <Button variant="ghost" size="icon-sm" className="text-zinc-500" title="Historique">
                            <History className="h-4 w-4" />
                          </Button>
                        } />
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Historique des Paiements</DialogTitle>
                            <DialogDescription>
                              Versements effectués par {candidate.nom} {candidate.postnom}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            <PaymentHistory payments={candidate.payments} />
                          </div>
                        </DialogContent>
                      </Dialog>

                      {(candidate.statut as string) !== CANDIDATE_STATUS.FULLY_PAID && (candidate.statut as string) !== CANDIDATE_STATUS.REJECTED && (
                        <AddPaymentDialog 
                          candidatId={candidate.id} 
                          candidatName={`${candidate.nom} ${candidate.postnom}`}
                          remainingAmount={remaining}
                        />
                      )}

                      {(candidate.statut as string) === CANDIDATE_STATUS.PENDING && (
                        <Button
                          size="icon-sm"
                          variant="outline"
                          title="Rejeter"
                          className="text-red-500 border-red-200 bg-red-50 hover:bg-red-100"
                          onClick={() => handleStatusUpdate(candidate.id, "REJECTED")}
                          disabled={loadingId === candidate.id}
                        >
                          {loadingId === candidate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
