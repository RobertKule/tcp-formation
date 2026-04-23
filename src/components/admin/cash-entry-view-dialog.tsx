"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { type CashEntry } from "@prisma/client"
import { Calendar, Receipt, DollarSign, Tag, Info, User } from "lucide-react"

interface CashEntryViewDialogProps {
  entry: CashEntry
  trigger: React.ReactNode
}

export function CashEntryViewDialog({ entry, trigger }: CashEntryViewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger as any} />
      <DialogContent className="max-w-md border-0 shadow-2xl rounded-[2rem] p-0 overflow-hidden">
        <div className={`h-32 flex items-center justify-center ${entry.type === "ENTREE" ? "bg-green-600" : "bg-red-600"}`}>
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
            <Receipt className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
             <DialogTitle className="text-2xl font-bold text-zinc-900">{entry.label}</DialogTitle>
             <div className="flex items-center justify-center gap-2 text-zinc-500 font-medium">
               <User className="w-3.5 h-3.5" />
               <span>{(entry as any).beneficiary || "Aucun bénéficiaire spécifié"}</span>
             </div>
             <p className="text-zinc-400 text-sm mt-1">{entry.accountNumber || "Pas de numéro de compte"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
               <div className="flex items-center gap-2 text-zinc-400">
                 <Calendar className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Date</span>
               </div>
               <p className="font-semibold text-zinc-800">{format(new Date(entry.date), "dd MMMM yyyy", { locale: fr })}</p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-2xl space-y-1">
               <div className="flex items-center gap-2 text-zinc-400">
                 <Tag className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Type</span>
               </div>
               <Badge variant="outline" className={entry.type === "ENTREE" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                 {entry.type === "ENTREE" ? "RECU" : "DEPENSE"}
               </Badge>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Montant</span>
              </div>
              <p className={`text-3xl font-black ${entry.type === "ENTREE" ? "text-green-600" : "text-red-600"}`}>
                ${entry.amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right space-y-1">
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Solde après</span>
               <p className="text-lg font-bold text-zinc-700">${entry.balance.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl">
             <Info className="w-5 h-5 text-zinc-400 shrink-0" />
             <p className="text-xs text-zinc-500 leading-relaxed">
               Cette opération a été enregistrée dans le journal de caisse TCP. 
               Le solde est recalculé automatiquement à chaque nouvelle entrée.
             </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
