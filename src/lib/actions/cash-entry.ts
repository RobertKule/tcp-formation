"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCashEntries() {
  try {
    const entries = await (prisma as any).cashEntry.findMany({
      orderBy: { date: "asc" }
    })
    return { success: true, data: entries }
  } catch (error) {
    console.error("Error fetching cash entries:", error)
    return { success: false, error: "Erreur lors de la récupération du journal." }
  }
}

export async function createCashEntry(data: {
  date: Date;
  accountNumber?: string;
  label: string;
  amount: number;
  beneficiary?: string;
  type: "ENTREE" | "SORTIE";
}) {
  try {
    // Get last balance
    const lastEntry = await (prisma as any).cashEntry.findFirst({
      orderBy: { date: "desc" }
    })

    const currentBalance = lastEntry ? lastEntry.balance : 0
    const newBalance = data.type === "ENTREE" 
      ? currentBalance + data.amount 
      : currentBalance - data.amount
    
    const entry = await (prisma as any).cashEntry.create({
      data: {
        ...data,
        balance: newBalance
      }
    })

    revalidatePath("/admin")
    return { success: true, data: entry }
  } catch (error) {
    console.error("Error creating cash entry:", error)
    return { success: false, error: "Erreur lors de l'ajout de l'opération." }
  }
}

export async function updateCashEntry(id: string, data: {
  date?: Date;
  accountNumber?: string;
  label?: string;
  amount?: number;
  beneficiary?: string;
  type?: "ENTREE" | "SORTIE";
}) {
  try {
    const entry = await (prisma as any).cashEntry.update({
      where: { id },
      data
    })
    
    // Recalculate all balances after this date if necessary
    // For simplicity in this first version, we'll just revalidate and assume manual balance checks
    // Long term: trigger a full balance recalculation task
    
    revalidatePath("/admin")
    return { success: true, data: entry }
  } catch (error) {
    console.error("Error updating cash entry:", error)
    return { success: false, error: "Erreur lors de la modification." }
  }
}

export async function deleteCashEntry(id: string) {
  try {
    await (prisma as any).cashEntry.delete({
      where: { id }
    })
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting cash entry:", error)
    return { success: false, error: "Erreur lors de la suppression." }
  }
}
