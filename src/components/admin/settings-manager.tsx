"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Save, Globe, MapPin, Phone, Mail } from "lucide-react"
import { getSettings, updateSettings } from "@/lib/actions/settings"

const settingsSchema = z.object({
  address: z.string().min(1, "L'adresse est requise"),
  phonePrimary: z.string().min(1, "Le téléphone principal est requis"),
  phoneSecondary: z.string().optional(),
  email: z.string().email("Email invalide"),
  webUrl: z.string().min(1, "L'URL web est requise"),
  latitude: z.number(),
  longitude: z.number(),
})

type SettingsValues = z.infer<typeof settingsSchema>

export function SettingsManager() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      address: "",
      phonePrimary: "",
      phoneSecondary: "",
      email: "",
      webUrl: "",
      latitude: 0,
      longitude: 0,
    },
  })

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettings()
      if (data) {
        form.reset({
          address: data.address,
          phonePrimary: data.phonePrimary,
          phoneSecondary: data.phoneSecondary || "",
          email: data.email,
          webUrl: data.webUrl,
          latitude: data.latitude,
          longitude: data.longitude,
        })
      }
      setLoading(false)
    }
    loadSettings()
  }, [form])

  async function onSubmit(values: SettingsValues) {
    setSaving(true)
    const result = await updateSettings(values)
    setSaving(false)

    if (result.success) {
      toast.success("Paramètres mis à jour avec succès")
    } else {
      toast.error(result.error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#0B1527]">Paramètres de la Plateforme</h2>
          <p className="text-zinc-500">Gérez les informations de contact et la localisation affichées sur la page d'accueil.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Globe className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold uppercase tracking-wider">Contact & Web</CardTitle>
                </div>
                <CardDescription>Informations de contact publiques</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de contact</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                          <Input className="pl-10 h-11 bg-zinc-50 border-zinc-200" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="webUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Web</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                          <Input className="pl-10 h-11 bg-zinc-50 border-zinc-200" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phonePrimary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone Principal</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <Input className="pl-10 h-11 bg-zinc-50 border-zinc-200" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneSecondary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone Secondaire</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <Input className="pl-10 h-11 bg-zinc-50 border-zinc-200" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <MapPin className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold uppercase tracking-wider">Localisation & Carte</CardTitle>
                </div>
                <CardDescription>Coordonnées physiques et GPS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse Physique</FormLabel>
                      <FormControl>
                        <Input className="h-11 bg-zinc-50 border-zinc-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any" 
                            className="h-11 bg-zinc-50 border-zinc-200" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Ex: -1.5397</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any" 
                            className="h-11 bg-zinc-50 border-zinc-200" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Ex: 29.0213</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={saving}
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
