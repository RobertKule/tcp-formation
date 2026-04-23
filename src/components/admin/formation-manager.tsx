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
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createFormation, deleteFormation, updateFormation } from "@/lib/actions/formation"
import { Formation } from "@prisma/client"
import { Plus, Pencil, Trash, Loader2, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

const formSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  description: z.string().optional(),
  prix: z.number().min(0, "Le prix doit être positif"),
})

export function FormationManager({ formations }: { formations: Formation[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: "nom" | "prix", direction: "asc" | "desc" } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      description: "",
      prix: 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    let res
    if (editingId) {
      res = await updateFormation(editingId, values)
    } else {
      res = await createFormation(values)
    }
    setIsSubmitting(false)

    if (res.success) {
      toast.success(editingId ? "Formation mise à jour avec succès !" : "Nouvelle formation créée !")
      form.reset()
      setEditingId(null)
    } else {
      toast.error(res.error)
    }
  }

  const handleEdit = (formation: Formation) => {
    setEditingId(formation.id)
    form.setValue("nom", formation.nom)
    form.setValue("description", formation.description || "")
    form.setValue("prix", formation.prix)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Supprimer cette formation ?")) {
      const res = await deleteFormation(id)
      if (res.success) {
        toast.success("Formation supprimée avec succès !")
      } else {
        toast.error(res.error)
      }
    }
  }

  const handleSort = (key: "nom" | "prix") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const sortedFormations = [...formations].sort((a, b) => {
    if (!sortConfig) return 0
    if (sortConfig.key === "nom") {
      return sortConfig.direction === "asc" ? a.nom.localeCompare(b.nom) : b.nom.localeCompare(a.nom)
    }
    if (sortConfig.key === "prix") {
      return sortConfig.direction === "asc" ? a.prix - b.prix : b.prix - a.prix
    }
    return 0
  })

  const renderSortIcon = (columnKey: "nom" | "prix") => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-zinc-400 inline-block" />
    return sortConfig.direction === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4 text-zinc-800 inline-block" /> 
      : <ArrowDown className="ml-2 h-4 w-4 text-zinc-800 inline-block" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>{editingId ? "Modifier" : "Ajouter"} une Formation</CardTitle>
          <CardDescription>
            Définissez le nom, la description et le prix.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la formation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brève description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
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
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Mettre à jour" : "Créer"}
                </Button>
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditingId(null)
                      form.reset()
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-zinc-100">
        <CardHeader>
          <CardTitle>Liste des Formations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-zinc-100">
            <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-zinc-100 transition-colors" 
                  onClick={() => handleSort("nom")}
                >
                  <div className="flex items-center">Nom {renderSortIcon("nom")}</div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-zinc-100 transition-colors" 
                  onClick={() => handleSort("prix")}
                >
                  <div className="flex items-center">Prix {renderSortIcon("prix")}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFormations.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.nom}</TableCell>
                  <TableCell className="font-bold text-zinc-600">${f.prix}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 items-center">
                      <Dialog>
                        <DialogTrigger render={
                          <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                        } />
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Détails de la Formation</DialogTitle>
                            <DialogDescription>Voici les informations complètes sur ce programme.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                               <h3 className="text-sm font-semibold text-zinc-500">Intitulé</h3>
                               <p className="text-lg font-medium text-zinc-900">{f.nom}</p>
                            </div>
                            <div className="h-px w-full bg-zinc-100" />
                            <div>
                               <h3 className="text-sm font-semibold text-zinc-500">Description</h3>
                               <p className="text-base text-zinc-700 whitespace-pre-wrap">{f.description || "Aucune description fournie."}</p>
                            </div>
                            <div className="h-px w-full bg-zinc-100" />
                            <div>
                               <h3 className="text-sm font-semibold text-zinc-500">Tarif</h3>
                               <p className="text-2xl font-bold text-blue-600">${f.prix}</p>
                            </div>
                            <div className="text-xs text-zinc-400 mt-4 text-right">
                               Créée le {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" size="icon" className="text-zinc-500" onClick={() => handleEdit(f)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(f.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
