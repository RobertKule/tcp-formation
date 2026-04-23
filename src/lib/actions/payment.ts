"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { CANDIDATE_STATUS, PAYMENT_MODE } from "../constants"

const paymentSchema = z.object({
  candidatId: z.string(),
  amount: z.number().positive("Le montant doit être supérieur à 0"),
  paymentMode: z.enum([PAYMENT_MODE.CASH, PAYMENT_MODE.MOBILE_MONEY]),
  captureUrl: z.string().optional(),
  adminId: z.string().optional(),
})

export async function addPayment(data: z.infer<typeof paymentSchema>) {
  try {
    const { candidatId, amount, paymentMode, captureUrl, adminId } = paymentSchema.parse(data)

    // 1. Récupérer le candidat et sa formation
    const candidate = await prisma.candidat.findUnique({
      where: { id: candidatId },
      include: { 
        formation: true,
        payments: true 
      }
    })

    if (!candidate) throw new Error("Candidat non trouvé")

    // 2. Calculer le total déjà payé
    const totalPaid = candidate.payments.reduce((sum: number, p: any) => sum + p.amount, 0)
    const totalPrice = candidate.formation.prix
    const remaining = totalPrice - totalPaid

    // 3. Validation de versement (Règle 1)
    if (amount > remaining) {
      throw new Error(`Le montant (${amount}$) dépasse le reste à payer (${remaining}$)`)
    }

    // 4. Créer le paiement
    const newPayment = await prisma.payment.create({
      data: {
        amount,
        paymentMode,
        captureUrl,
        adminId,
        candidatId
      }
    })

    // 5. Mettre à jour le statut du candidat (Règle 2)
    const newTotalPaid = totalPaid + amount
    let newStatus = candidate.statut

    if (newTotalPaid >= totalPrice) {
      newStatus = CANDIDATE_STATUS.FULLY_PAID
    } else if (newTotalPaid > 0) {
      newStatus = CANDIDATE_STATUS.PARTIALLY_PAID
    }

    await prisma.candidat.update({
      where: { id: candidatId },
      data: { statut: newStatus as any }
    })

    return { success: true, data: newPayment }
  } catch (error: any) {
    console.error("Payment error:", error)
    return { success: false, error: error.message || "Erreur lors du paiement" }
  } finally {
    revalidatePath("/admin")
  }
}
