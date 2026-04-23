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
import { updateCandidateStatus, deleteCandidate, assignMatricule } from "@/lib/actions/candidate"
import { validatePayment } from "@/lib/actions/payment"
import { Candidat, Formation, Payment } from "@prisma/client"
import { Check, X, Loader2, History, ArrowUpDown, ArrowUp, ArrowDown, Image as ImageIcon, Trash2, CheckCircle, Sparkles } from "lucide-react"
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
import { PrintReceiptButton } from "./print-receipt-button"
import { CANDIDATE_STATUS } from "@/lib/constants"

export type CandidateWithAll = Candidat & {
  formation: Formation
  payments: Payment[]
}

export function CandidateTable({ candidates }: { candidates: CandidateWithAll[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: "nom" | "formation" | "statut", direction: "asc" | "desc" } | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string } | null>(null)

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

  const handlePaymentValidation = async (paymentId: string, status: "APPROVED" | "REJECTED") => {
    setLoadingId(paymentId)
    const res = await validatePayment(paymentId, status)
    setLoadingId(null)
    if (res.success) {
      toast.success(status === "APPROVED" ? "Paiement approuvé" : "Paiement rejeté")
    } else {
      toast.error(res.error)
    }
  }

  const handleDelete = (id: string, name: string) => {
    setCandidateToDelete({ id, name })
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!candidateToDelete) return
    
    setLoadingId(candidateToDelete.id)
    const res = await deleteCandidate(candidateToDelete.id)
    setLoadingId(null)
    
    if (res.success) {
      toast.success("Candidat supprimé avec succès")
      setDeleteModalOpen(false)
      setCandidateToDelete(null)
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
    <>
      <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-zinc-50">
          <TableRow>
            <TableHead className="cursor-pointer hover:bg-zinc-100 transition-colors whitespace-nowrap" onClick={() => handleSort("nom")}>
               <div className="flex items-center">Candidat {renderSortIcon("nom")}</div>
            </TableHead>
            <TableHead>Matricule</TableHead>
            <TableHead className="cursor-pointer hover:bg-zinc-100 transition-colors whitespace-nowrap" onClick={() => handleSort("formation")}>
               <div className="flex items-center">Formation {renderSortIcon("formation")}</div>
            </TableHead>
            <TableHead>Paiement (Approuvé)</TableHead>
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
              const totalPaid = candidate.payments
                .filter(p => (p as any).statut === "APPROVED")
                .reduce((sum, p) => sum + p.amount, 0)
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
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="font-mono text-[10px] bg-zinc-50">{(candidate as any).matricule || "N/A"}</Badge>
                       {!(candidate as any).matricule && (
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-6 w-6 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                           onClick={async () => {
                             setLoadingId(candidate.id)
                             const res = await assignMatricule(candidate.id)
                             setLoadingId(null)
                             if (res.success) toast.success(`Matricule généré: ${res.matricule}`)
                             else toast.error(res.error)
                           }}
                           disabled={loadingId === candidate.id}
                           title="Générer le matricule"
                         >
                           {loadingId === candidate.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                         </Button>
                       )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{candidate.formation.nom}</div>
                    <div className="text-xs text-muted-foreground">{candidate.formation.prix} $</div>
                  </TableCell>
                  <TableCell className="min-w-[150px]">
                    <div className="space-y-1">
                      <PaymentProgress totalPaid={totalPaid} totalPrice={candidate.formation.prix} />
                      {candidate.payments.some(p => (p as any).statut === "PENDING") && (
                        <div className="flex items-center text-orange-600 text-[10px] font-bold">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          PAIEMENT EN ATTENTE
                        </div>
                      )}
                    </div>
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
                            <PaymentHistory 
                              payments={candidate.payments} 
                              candidateName={`${candidate.nom} ${candidate.postnom}`}
                              matricule={(candidate as any).matricule || undefined}
                            />
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

                      {/* Payment Validation Buttons */}
                      {candidate.payments.filter(p => (p as any).statut === "PENDING").map((pendingPayment) => (
                        <div key={pendingPayment.id} className="flex gap-1 border-l pl-2 border-zinc-100 ml-1">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title={`Valider paiement de ${pendingPayment.amount}$`}
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handlePaymentValidation(pendingPayment.id, "APPROVED")}
                            disabled={loadingId === pendingPayment.id}
                          >
                            {loadingId === pendingPayment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title={`Rejeter paiement de ${pendingPayment.amount}$`}
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handlePaymentValidation(pendingPayment.id, "REJECTED")}
                            disabled={loadingId === pendingPayment.id}
                          >
                            {loadingId === pendingPayment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))}

                      <Button
                        size="icon-sm"
                        variant="outline"
                        title="Supprimer"
                        className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                        onClick={() => handleDelete(candidate.id, `${candidate.nom} ${candidate.postnom}`)}
                        disabled={loadingId === candidate.id}
                      >
                        {loadingId === candidate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>

      {/* Modal de confirmation de suppression */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-zinc-50">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#0B1527]">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-zinc-600">
              Êtes-vous sûr de vouloir supprimer <span className="font-semibold text-[#0B1527]">{candidateToDelete?.name}</span> ?
            </DialogDescription>
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 border border-red-100">
              ⚠️ Cette action est irréversible et supprimera également tous les paiements associés.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 h-11 border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              disabled={loadingId === candidateToDelete?.id}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02]"
              disabled={loadingId === candidateToDelete?.id}
            >
              {loadingId === candidateToDelete?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
