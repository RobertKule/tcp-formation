"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const formationSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  description: z.string().optional(),
  prix: z.number().min(0, "Le prix doit être positif"),
})

export async function createFormation(formData: z.infer<typeof formationSchema>) {
  try {
    const validatedData = formationSchema.parse(formData)
    const formation = await prisma.formation.create({
      data: validatedData,
    })
    revalidatePath("/admin")
    return { success: true, data: formation }
  } catch (error) {
    console.error("Error creating formation:", error)
    return { success: false, error: "Erreur lors de la création." }
  }
}

export async function updateFormation(id: string, formData: z.infer<typeof formationSchema>) {
  try {
    const validatedData = formationSchema.parse(formData)
    const formation = await prisma.formation.update({
      where: { id },
      data: validatedData,
    })
    revalidatePath("/admin")
    return { success: true, data: formation }
  } catch (error) {
    console.error("Error updating formation:", error)
    return { success: false, error: "Erreur lors de la modification." }
  }
}

export async function deleteFormation(id: string) {
  try {
    await prisma.formation.delete({
      where: { id },
    })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting formation:", error)
    return { success: false, error: "Erreur lors de la suppression." }
  }
}

export async function getFormations() {
  return await prisma.formation.findMany({
    orderBy: { createdAt: "desc" },
  })
}
