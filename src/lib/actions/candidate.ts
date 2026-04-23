"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { CANDIDATE_STATUS } from "../constants"
import { v2 as cloudinary } from "cloudinary"

const resend = new Resend(process.env.RESEND_API_KEY)

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const candidateSchema = z.object({
  nom: z.string().min(2, "Le nom est requis"),
  postnom: z.string().min(2, "Le postnom est requis"),
  prenom: z.string().optional(),
  adresse: z.string().optional(),
  telephone: z.string().min(10, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  modePaiement: z.enum(["CASH", "MOBILE_MONEY"]),
  montant: z.coerce.number().optional(),
  capturePaiementUrl: z.string().optional().nullable(),
  formationId: z.string().min(1, "Veuillez choisir une formation"),
})

export async function createCandidate(formData: z.infer<typeof candidateSchema>) {
  try {
    const validatedData = candidateSchema.parse(formData)
    let { montant, modePaiement, capturePaiementUrl, ...candidatInfo } = validatedData

    // Upload picture securely if a base64 blob was sent
    if (capturePaiementUrl && capturePaiementUrl.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(capturePaiementUrl, {
           folder: "formation_proofs"
        })
        capturePaiementUrl = uploadRes.secure_url
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError)
        return { success: false, error: "Échec du téléversement de l'image sur le serveur." }
      }
    }

    // 1. Créer le candidat
    const newCandidate = await prisma.candidat.create({
      data: {
        ...candidatInfo,
        statut: CANDIDATE_STATUS.PENDING as any,
      },
      include: { formation: true }
    }) as Prisma.CandidatGetPayload<{ include: { formation: true } }>

    let result = newCandidate

    // 2. Créer le paiement initial si présent
    if ((montant !== undefined && montant > 0) || (capturePaiementUrl)) {
      await prisma.payment.create({
        data: {
          amount: montant ?? 0,
          paymentMode: modePaiement as any,
          captureUrl: capturePaiementUrl,
          candidatId: newCandidate.id
        }
      })

      // Mettre à jour le statut
      const status = (montant && montant >= newCandidate.formation.prix)
        ? CANDIDATE_STATUS.FULLY_PAID 
        : CANDIDATE_STATUS.PARTIALLY_PAID
      
      result = await prisma.candidat.update({
        where: { id: newCandidate.id },
        data: { statut: status as any },
        include: { formation: true }
      }) as Prisma.CandidatGetPayload<{ include: { formation: true } }>
    }

    // Envoyer email au candidat
    await resend.emails.send({
      from: "Formation Platform <onboarding@resend.dev>",
      to: result.email,
      subject: "Confirmation d'inscription",
      html: `<p>Bonjour ${result.prenom || ""} ${result.nom},</p>
             <p>Votre inscription à la formation <strong>${result.formation.nom}</strong> a bien été reçue.</p>
             <p>Statut actuel : <strong>${result.statut}</strong></p>
             <p>Bienvenue parmi nous !</p>`,
    })

    revalidatePath("/admin")
    return { success: true, data: result }
  } catch (error) {
    console.error("Error creating candidate:", error)
    return { success: false, error: "Une erreur est survenue lors de l'inscription." }
  }
}

export async function updateCandidateStatus(id: string, statut: "REJECTED" | "PENDING") {
  try {
    const candidate = await prisma.candidat.update({
      where: { id },
      data: { statut: statut as any },
      include: { formation: true },
    })

    await resend.emails.send({
      from: "Formation Platform <onboarding@resend.dev>",
      to: candidate.email,
      subject: `Mise à jour de votre candidature`,
      html: `<p>Bonjour ${candidate.nom},</p>
             <p>Le statut de votre candidature pour la formation <strong>${candidate.formation.nom}</strong> est maintenant : <strong>${statut}</strong>.</p>`,
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error updating status:", error)
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}

export async function deleteCandidate(candidateId: string) {
  try {
    // Récupérer le candidat avec ses paiements
    const candidate = await prisma.candidat.findUnique({
      where: { id: candidateId },
      include: { payments: true }
    })

    if (!candidate) {
      return { success: false, error: "Candidat non trouvé." }
    }

    // Supprimer d'abord tous les paiements associés
    await prisma.payment.deleteMany({
      where: { candidatId: candidateId }
    })

    // Supprimer le candidat
    await prisma.candidat.delete({
      where: { id: candidateId }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting candidate:", error)
    return { success: false, error: "Erreur lors de la suppression." }
  }
}
