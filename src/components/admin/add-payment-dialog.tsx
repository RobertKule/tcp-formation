"use client"

import { useState } from "react"
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
import { addPayment } from "@/lib/actions/payment"
import { CandidateStatus, PAYMENT_MODE } from "@/lib/constants"
import { Loader2, PlusCircle, Upload, FileImage, X } from "lucide-react"

const formSchema = z.object({
  // z.number() — coercion handled in onChange via valueAsNumber
  amount: z.number().positive("Le montant doit être supérieur à 0"),
  paymentMode: z.enum([PAYMENT_MODE.CASH, PAYMENT_MODE.MOBILE_MONEY]),
  captureUrl: z.string().optional(),
})

interface AddPaymentDialogProps {
  candidatId: string
  candidatName: string
  remainingAmount: number
}

export function AddPaymentDialog({ candidatId, candidatName, remainingAmount }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: remainingAmount > 0 ? remainingAmount : 0,
      paymentMode: "CASH",
      captureUrl: "",
    },
  })

  const paymentMode = form.watch("paymentMode")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez uploader une image (JPG, PNG, etc.)")
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB")
      return
    }

    setUploadedFile(file)
    
    // Simuler l'upload vers un service de stockage
    // Dans un vrai projet, tu utiliserais Cloudinary, AWS S3, etc.
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // Simulation - remplace par ton vrai service d'upload
      const mockUrl = `https://mock-upload.com/${file.name}`
      setUploadUrl(mockUrl)
      form.setValue('captureUrl', mockUrl)
      toast.success("Image uploadée avec succès!")
    } catch (error) {
      toast.error("Erreur lors de l'upload")
      setUploadedFile(null)
      setUploadUrl(null)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadUrl(null)
    form.setValue('captureUrl', '')
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    const res = await addPayment({
      ...values,
      candidatId,
    })
    setIsSubmitting(false)
    if (res.success) {
      toast.success("Versement enregistré avec succès !")
      setOpen(false)
      form.reset()
      setUploadedFile(null)
      setUploadUrl(null)
    } else {
      toast.error("error" in res ? (res.error as string) : "Une erreur est survenue")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="icon-sm" variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
          <PlusCircle className="w-4 h-4" />
        </Button>
      } />
      <DialogContent className="max-w-md border-0 shadow-2xl bg-gradient-to-br from-white to-zinc-50">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <PlusCircle className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#0B1527]">Nouveau Paiement</DialogTitle>
            <DialogDescription className="text-zinc-600">
              Enregistrer un versement pour <span className="font-semibold text-[#0B1527]">{candidatName}</span>
            </DialogDescription>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">Reste à payer</span>
              <span className="text-xl font-bold text-blue-600">{remainingAmount} $</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-700">Montant du versement ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-11 border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
                        onChange={(e) => {
                          const n = e.target.valueAsNumber
                          field.onChange(Number.isNaN(n) ? undefined : n)
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-700">Mode de paiement</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger className="h-11 border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20">
                          <SelectValue placeholder="Choisir un mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PAYMENT_MODE.CASH}>
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Espèces (Cash)
                          </div>
                        </SelectItem>
                        <SelectItem value={PAYMENT_MODE.MOBILE_MONEY}>
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Mobile Money
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Champ upload seulement si Mobile Money */}
              {paymentMode === PAYMENT_MODE.MOBILE_MONEY && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-700">Capture d'écran du paiement</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {!uploadedFile ? (
                          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="file-upload"
                            />
                            <label 
                              htmlFor="file-upload"
                              className="cursor-pointer flex flex-col items-center space-y-2"
                            >
                              <Upload className="w-8 h-8 text-zinc-400" />
                              <div className="text-sm text-zinc-600">
                                <span className="font-medium text-blue-600">Cliquez pour uploader</span> ou glissez-déposez
                              </div>
                              <p className="text-xs text-zinc-500">PNG, JPG jusqu'à 5MB</p>
                            </label>
                          </div>
                        ) : (
                          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileImage className="w-8 h-8 text-blue-600" />
                                <div>
                                  <p className="text-sm font-medium text-zinc-700">{uploadedFile.name}</p>
                                  <p className="text-xs text-zinc-500">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeFile}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]" 
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Confirmer le versement
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
