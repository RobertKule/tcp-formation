"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { encrypt } from "@/lib/auth"

export async function login(formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")

  // Vérification des identifiants fournis dans le .env
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Création de la session
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 heures
    const session = await encrypt({ user: { email }, expires })

    // Sauvegarde dans un cookie
    ;(await cookies()).set("session", session, { expires, httpOnly: true })
    
    redirect("/admin")
  } else {
    return { error: "Identifiants invalides" }
  }
}

export async function logout() {
  // Destruction du cookie de session
  ;(await cookies()).delete("session")
  redirect("/admin/login")
}
