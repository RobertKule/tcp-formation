"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Formation } from "@prisma/client"
import { Loader2, UploadCloud, CheckCircle2, ChevronLeft } from "lucide-react"
import { createCandidate } from "@/lib/actions/candidate"

const formSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  postnom: z.string().min(2, "Le postnom est requis"),
  prenom: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().min(10, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  modePaiement: z.enum(["CASH", "MOBILE_MONEY"]),
  montant: z.number().min(0).optional(),
  capturePaiementUrl: z.string().optional().nullable(),
  formationId: z.string().min(1, "Veuillez choisir une formation"),
})

export function RegistrationForm({ 
  formations, 
  isAdmin = false,
  onSuccess 
}: { 
  formations: Formation[],
  isAdmin?: boolean,
  onSuccess?: () => void
}) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      postnom: "",
      prenom: "",
      adresse: "",
      telephone: "",
      email: "",
      modePaiement: "CASH",
      montant: undefined,
      capturePaiementUrl: null,
      formationId: "",
    },
  })

  const watchModePaiement = form.watch("modePaiement")

  type StepKeys = keyof z.infer<typeof formSchema>

  const steps = [
    { id: 1, title: "Choix de la formation", fields: ["formationId"] as StepKeys[] },
    { id: 2, title: "Vos informations", fields: ["nom", "postnom", "prenom", "email", "telephone"] as StepKeys[] },
    { id: 3, title: "Paiement", fields: ["modePaiement", "montant", "capturePaiementUrl"] as StepKeys[] },
    { id: 4, title: "Récapitulatif", fields: [] as StepKeys[] },
  ]

  const currentStepInfo = steps[step - 1]

  const handleNext = async () => {
    const isValid = await form.trigger(currentStepInfo.fields)
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (step !== 4) return // Prevent enter key submission from earlier steps
    
    setIsSubmitting(true)
    const res = await createCandidate({
      ...values,
      montant: values.montant ?? undefined,
      capturePaiementUrl: values.capturePaiementUrl ?? undefined,
    })
    setIsSubmitting(false)
    if (res.success) {
      if (isAdmin && onSuccess) {
        toast.success("Candidat ajouté avec succès !")
        onSuccess()
        form.reset()
        setStep(1)
        setUploadUrl(null)
      } else {
        toast.success("Inscription validée !")
        setIsSuccess(true)
      }
    } else {
      toast.error(res.error)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center w-full">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-[#0B1527] mb-4">Inscription réussie !</h2>
        <p className="text-[#4A5568] mb-8 text-lg">
          Votre dossier a bien été enregistré. Un email de confirmation vous a été envoyé.
        </p>
        <Button 
          onClick={() => {
            setIsSuccess(false)
            setStep(1)
            form.reset()
            setUploadUrl(null)
          }}
          className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          Retour à l'accueil
        </Button>
      </div>
    )
  }

  // Pre-compute selected formation for step 4
  const selectedFormationId = form.watch("formationId")
  const selectedFormation = formations.find(f => f.id === selectedFormationId)

  return (
    <div className="bg-white p-6 lg:p-10 !pb-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col min-h-[550px] w-full">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
             <div className="w-9" />
          )}
          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded ml-2 mr-3">
             {step}
          </span>
          <h2 className="text-2xl font-bold text-[#0B1527]">
            {currentStepInfo.title}
          </h2>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-zinc-500 font-medium">Étape {step} sur 4</div>
          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1">
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FormField
                  control={form.control}
                  name="formationId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-3 mt-4">
                        {formations.map((f) => {
                          const isSelected = field.value === f.id
                          return (
                            <div 
                              key={f.id} 
                              onClick={() => field.onChange(f.id)}
                              className={`border-2 rounded-xl p-5 cursor-pointer flex justify-between items-center transition-all ${
                                isSelected 
                                ? "border-blue-600 bg-blue-50/50" 
                                : "border-zinc-200 hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-600" : "border-zinc-300"}`}>
                                  {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold text-[#0B1527] text-lg leading-none">{f.nom}</p>
                                  <p className="text-sm text-zinc-500 leading-none">Accès illimité aux ressources</p>
                                </div>
                              </div>
                              <div className="font-bold text-blue-600 text-xl whitespace-nowrap">
                                ${f.prix}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <FormMessage className="mt-4 block" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-600">Nom</FormLabel>
                        <FormControl>
                          <Input className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="Ex: Lumumba" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postnom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-600">Postnom</FormLabel>
                        <FormControl>
                          <Input className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="Ex: Patrice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-600">Prénom (Optionnel)</FormLabel>
                      <FormControl>
                        <Input className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="Ex: Emery" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-600">Adresse Email</FormLabel>
                        <FormControl>
                          <Input type="email" className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="patrice@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-600">Numéro de Téléphone</FormLabel>
                        <FormControl>
                          <Input className="h-12 bg-zinc-50 border-zinc-200 rounded-xl" placeholder="+243..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FormField
                  control={form.control}
                  name="modePaiement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-600 mb-2 block">Comment souhaitez-vous payer ?</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          onClick={() => field.onChange("CASH")}
                          className={`border-2 rounded-xl p-4 cursor-pointer flex items-center justify-center space-x-2 transition-all ${field.value === "CASH" ? "border-blue-600 bg-blue-50 text-blue-700 font-medium" : "border-zinc-200 text-zinc-600 hover:border-blue-300"}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${field.value === "CASH" ? "border-blue-600" : "border-zinc-300"}`}>
                             {field.value === "CASH" && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                          </div>
                          <span>En espèces (Cash)</span>
                        </div>
                        <div 
                          onClick={() => field.onChange("MOBILE_MONEY")}
                          className={`border-2 rounded-xl p-4 cursor-pointer flex items-center justify-center space-x-2 transition-all ${field.value === "MOBILE_MONEY" ? "border-blue-600 bg-blue-50 text-blue-700 font-medium" : "border-zinc-200 text-zinc-600 hover:border-blue-300"}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${field.value === "MOBILE_MONEY" ? "border-blue-600" : "border-zinc-300"}`}>
                             {field.value === "MOBILE_MONEY" && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                          </div>
                          <span>Mobile Money</span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="montant"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in zoom-in-95 duration-200">
                      <FormLabel className="text-zinc-600">Acompte / Montant à verser ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 50.00"
                          className="h-12 bg-zinc-50 border-zinc-200 rounded-xl text-lg font-medium"
                          onChange={(e) => {
                            const n = e.target.valueAsNumber
                            field.onChange(Number.isNaN(n) ? undefined : n)
                          }}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <p className="text-xs text-zinc-400 mt-2">Vous pourrez payer le reste plus tard si vous ne payez pas la totalité maintenant.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchModePaiement === "MOBILE_MONEY" && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <FormLabel className="text-zinc-600">Preuve de paiement (Screenshot)</FormLabel>
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="proof-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64String = reader.result as string;
                              form.setValue("capturePaiementUrl", base64String);
                              setUploadUrl(base64String);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label 
                        htmlFor="proof-upload"
                        className="border-2 border-dashed border-zinc-200 rounded-xl text-zinc-500 hover:text-blue-600 hover:border-blue-400 p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-zinc-50/50 block"
                      >
                        {uploadUrl ? (
                          <img src={uploadUrl} alt="Capture Uploadée" className="max-h-40 rounded shadow-sm" />
                        ) : (
                          <>
                            <UploadCloud className="h-10 w-10 mb-3 opacity-80" />
                            <p className="text-sm font-medium">Cliquez pour importer une image</p>
                            <p className="text-xs text-zinc-400 mt-1">PNG, JPG format autorisé</p>
                          </>
                        )}
                      </label>
                    </div>
                    {form.formState.errors.capturePaiementUrl && (
                      <p className="text-sm text-red-500 font-medium mt-2">{form.formState.errors.capturePaiementUrl.message || "Capture requise"}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- STEP 4: Récapitulatif --- */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 mb-1">Formation sélectionnée</h3>
                    <p className="text-lg font-semibold text-[#0B1527]">{selectedFormation?.nom}</p>
                    <p className="text-sm text-blue-600 font-medium">${selectedFormation?.prix}</p>
                  </div>
                  <div className="h-px bg-zinc-200 w-full" />
                  
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 mb-1">Candidat</h3>
                    <p className="text-base text-[#0B1527] font-medium">
                      {form.watch("nom")} {form.watch("postnom")} {form.watch("prenom")}
                    </p>
                    <p className="text-sm text-zinc-600">{form.watch("email")} • {form.watch("telephone")}</p>
                  </div>
                  <div className="h-px bg-zinc-200 w-full" />
                  
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 mb-1">Modalité de paiement</h3>
                    <p className="text-base text-[#0B1527]">
                      {watchModePaiement === "CASH" ? "Espèces (Cash)" : "Mobile Money"}
                    </p>
                    {watchModePaiement === "CASH" && form.watch("montant") && (
                      <p className="text-sm text-zinc-600">Acompte déclaré : ${form.watch("montant")}</p>
                    )}
                    {watchModePaiement === "MOBILE_MONEY" && uploadUrl && (
                      <p className="text-sm text-green-600 font-medium flex items-center mt-1">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Preuve uploadée
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-zinc-500 text-center">
                  Veuillez vérifier vos informations avant de finaliser votre inscription.
                </p>
              </div>
            )}
          </div>

          <div className="pt-8 mt-4">
             {step < 4 ? (
              <Button 
                type="button" 
                onClick={handleNext} 
                className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
              >
                Suivant
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement en cours...</>
                ) : (
                  "Valider mon inscription"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
