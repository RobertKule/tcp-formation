"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CANDIDATE_STATUS } from "../constants"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function addPayment(data: { 
  amount: number; 
  paymentMode: string; 
  captureUrl?: string; 
  candidatId: string;
  statut?: string;
}) {
  try {
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        paymentMode: data.paymentMode,
        captureUrl: data.captureUrl,
        candidatId: data.candidatId,
        statut: data.statut || "PENDING"
      }
    })
    revalidatePath("/admin")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Error adding payment:", error)
    return { success: false, error: "Erreur lors de l'ajout du paiement." }
  }
}

export async function validatePayment(paymentId: string, status: "APPROVED" | "REJECTED", commentaire?: string) {
  try {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        statut: status,
        commentaire: commentaire 
      },
      include: {
        candidat: {
          include: {
            formation: true,
            payments: true
          }
        }
      }
    })

    const candidate = payment.candidat
    const formation = candidate.formation

    // Recalculer le statut du candidat en fonction des paiements APPROUVÉS
    const allApprovedPayments = await prisma.payment.findMany({
      where: { 
        candidatId: candidate.id,
        statut: "APPROVED"
      }
    })

    const totalPaid = allApprovedPayments.reduce((sum, p) => sum + p.amount, 0)
    
    let newStatus = candidate.statut
    if (totalPaid >= formation.prix) {
      newStatus = CANDIDATE_STATUS.FULLY_PAID
    } else if (totalPaid > 0) {
      newStatus = CANDIDATE_STATUS.PARTIALLY_PAID
    } else {
        newStatus = CANDIDATE_STATUS.PENDING
    }

    if (newStatus !== candidate.statut) {
      await prisma.candidat.update({
        where: { id: candidate.id },
        data: { statut: newStatus as any }
      })
    }

    // Email notification
    try {
        await resend.emails.send({
          from: "Formation Platform <onboarding@resend.dev>",
          to: candidate.email,
          subject: status === "APPROVED" ? "Paiement validé" : "Paiement rejeté",
          html: `<p>Bonjour ${candidate.nom},</p>
                 <p>Votre paiement de <strong>${payment.amount} $</strong> a été ${status === "APPROVED" ? "validé" : "rejeté"}.</p>
                 ${commentaire ? `<p>Commentaire de l'admin : ${commentaire}</p>` : ""}
                 <p>Statut actuel de votre dossier : <strong>${newStatus}</strong></p>`,
        })
    } catch (emailError) {
        console.error("Email notification error:", emailError)
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error validating payment:", error)
    return { success: false, error: "Erreur lors de la validation du paiement." }
  }
}
