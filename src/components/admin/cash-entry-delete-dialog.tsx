"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { deleteCashEntry } from "@/lib/actions/cash-entry"
import { toast } from "sonner"
import { type CashEntry } from "@prisma/client"

interface CashEntryDeleteDialogProps {
  entry: CashEntry
  trigger: React.ReactNode
}

export function CashEntryDeleteDialog({ entry, trigger }: CashEntryDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const res = await deleteCashEntry(entry.id)
    setIsDeleting(false)
    
    if (res.success) {
      toast.success("Opération supprimée avec succès")
      setOpen(false)
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as any} />
      <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-zinc-50 rounded-[2rem]">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#0B1527]">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-zinc-600">
              Êtes-vous sûr de vouloir supprimer l'opération : <br/>
              <span className="font-bold text-[#0B1527] text-lg">"{entry.label}"</span> ?
            </DialogDescription>
            <div className="bg-red-50 text-red-700 text-xs p-4 rounded-xl border border-red-100 text-left space-y-2">
               <p className="font-bold">⚠️ Attention :</p>
               <ul className="list-disc list-inside space-y-0.5">
                 <li>Cette action est irréversible.</li>
                 <li>Le solde de la caisse ne sera pas automatiquement recalculé pour les entrées futures (dans cette version).</li>
               </ul>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-12 border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl"
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] rounded-xl"
              disabled={isDeleting}
            >
              {isDeleting ? (
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
  )
}
