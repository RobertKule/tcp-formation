"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Loader2, Pencil } from "lucide-react"
import { createCashEntry, updateCashEntry } from "@/lib/actions/cash-entry"
import { type CashEntry } from "@prisma/client"

const formSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  accountNumber: z.string().optional(),
  label: z.string().min(3, "Le libellé est requis"),
  beneficiary: z.string().optional(),
  amount: z.number().positive("Le montant doit être supérieur à 0"),
  type: z.enum(["ENTREE", "SORTIE"]),
})

interface CashEntryDialogProps {
  entry?: CashEntry
  trigger?: React.ReactNode
}

export function CashEntryDialog({ entry, trigger }: CashEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: entry ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      accountNumber: entry?.accountNumber || "",
      label: entry?.label || "",
      beneficiary: (entry as any)?.beneficiary || "",
      amount: entry?.amount || 0,
      type: (entry?.type as any) || "ENTREE",
    },
  })

  // Reset form when entry changes (for Edit mode)
  useEffect(() => {
    if (entry) {
      form.reset({
        date: new Date(entry.date).toISOString().split('T')[0],
        accountNumber: entry.accountNumber || "",
        label: entry.label,
        beneficiary: (entry as any).beneficiary || "",
        amount: entry.amount,
        type: entry.type as any,
      })
    }
  }, [entry, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    let res
    if (entry) {
      res = await updateCashEntry(entry.id, {
        ...values,
        date: new Date(values.date),
      })
    } else {
      res = await createCashEntry({
        ...values,
        date: new Date(values.date),
      })
    }
    setIsSubmitting(false)
    
    if (res.success) {
      toast.success(entry ? "Opération modifiée !" : "Opération enregistrée !")
      setOpen(false)
      if (!entry) form.reset()
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        (trigger as any) || (
          <Button className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg px-6">
            <PlusCircle className="w-4 h-4 mr-2" />
            Opération
          </Button>
        )
      } />
      <DialogContent className="max-w-md border-0 shadow-2xl rounded-[2rem]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            {entry ? "Modifier l'Opération" : "Nouvelle Opération"}
          </DialogTitle>
          <DialogDescription>
            {entry ? "Modifiez les détails de cette transaction." : "Ajouter une entrée ou une sortie de caisse."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11 rounded-xl bg-zinc-50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl bg-zinc-50">
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ENTREE">Entrée</SelectItem>
                        <SelectItem value="SORTIE">Sortie</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de compte (Optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1020-55" className="h-11 rounded-xl bg-zinc-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Libellé / Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Achat fournitures" className="h-11 rounded-xl bg-zinc-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="beneficiary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bénéficiaire / Donneur</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" className="h-11 rounded-xl bg-zinc-50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="h-11 rounded-xl bg-zinc-50 font-bold text-lg" 
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 mt-6 shadow-lg shadow-blue-500/20"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {entry ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
