"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Payment } from "@prisma/client"
import { CircleDollarSign, Calendar, Image as ImageIcon } from "lucide-react"
import { PrintReceiptButton } from "./print-receipt-button"

interface PaymentHistoryProps {
  payments: Payment[]
  candidateName: string
  matricule?: string
}

export function PaymentHistory({ payments, candidateName, matricule }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Aucun versement enregistré.</p>
  }

  return (
    <div className="space-y-4">
      {payments.sort((a,b) => new Date(b.datePayment).getTime() - new Date(a.datePayment).getTime()).map((payment) => (
        <div key={payment.id} className="flex gap-4 relative pb-4 last:pb-0">
          <div className="mt-1">
            <div className="bg-blue-100 p-2 rounded-full">
              <CircleDollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <p className="font-semibold text-zinc-900"> Versement de {payment.amount} $</p>
                <div className="flex gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    (payment as any).statut === "APPROVED" ? "bg-green-100 text-green-700" : 
                    (payment as any).statut === "REJECTED" ? "bg-red-100 text-red-700" : 
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {(payment as any).statut || "PENDING"}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider px-2 py-0.5 bg-zinc-100 rounded">
                    {payment.paymentMode}
                  </span>
                </div>
              </div>
              { (payment as any).statut === "APPROVED" && (
                <PrintReceiptButton data={{
                  type: "PAIEMENT",
                  nom: candidateName,
                  beneficiaire: candidateName,
                  matricule: matricule,
                  montant: payment.amount,
                  motif: `Paiement formation TCP - ${payment.paymentMode}`,
                  date: new Date(payment.datePayment),
                  modePaiement: payment.paymentMode
                }} />
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(payment.datePayment), "PPP", { locale: fr })}
              </div>
              {payment.adminId && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-zinc-700">Validé par:</span>
                  <span>{payment.adminId}</span>
                </div>
              )}
            </div>
            {payment.captureUrl && (
              <div className="mt-2 flex items-center p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                <a 
                  href={payment.captureUrl} 
                  target="_blank" 
                  className="flex items-center gap-3 w-full group overflow-hidden"
                >
                  <div className="h-12 w-16 bg-zinc-200 rounded shrink-0 overflow-hidden relative">
                     <img src={payment.captureUrl} alt="Preuve" className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-blue-600 group-hover:underline flex items-center">
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                      Ouvrir la preuve
                    </span>
                    <span className="text-xs text-zinc-400">Reçu uploadé</span>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
