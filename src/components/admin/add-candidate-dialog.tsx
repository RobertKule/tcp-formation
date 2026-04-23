"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RegistrationForm } from "@/components/registration-form"
import { Formation } from "@prisma/client"
import { Plus } from "lucide-react"

export function AddCandidateDialog({ formations }: { formations: Formation[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un candidat
        </Button>
      } />
      <DialogContent className="max-w-[700px] border-0 p-0 overflow-hidden bg-transparent shadow-none">
        <RegistrationForm 
          formations={formations} 
          isAdmin={true} 
          onSuccess={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
