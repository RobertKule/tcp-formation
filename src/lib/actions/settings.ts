"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  try {
    const settings = await (prisma as any).siteSettings.findUnique({
      where: { id: "global" }
    })
    
    if (!settings) {
      // Create default settings if they don't exist
      return await (prisma as any).siteSettings.create({
        data: { id: "global" }
      })
    }
    
    return settings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

export async function updateSettings(data: {
  address?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  webUrl?: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    await (prisma as any).siteSettings.update({
      where: { id: "global" },
      data
    })
    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error updating settings:", error)
    return { success: false, error: "Erreur lors de la mise à jour des paramètres" }
  }
}
