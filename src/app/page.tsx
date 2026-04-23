import { prisma } from "@/lib/prisma"
import { ErrorFallback } from "@/components/error-boundary"
import { getSettings } from "@/lib/actions/settings"
import { HomeClient } from "@/components/home/home-client"

export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const formations = await prisma.formation.findMany({
      orderBy: { createdAt: "desc" },
    })
    const settings = await getSettings()
    return { success: true, formations, settings }
  } catch (error) {
    console.error("Erreur Prisma:", error)
    return { success: false, error }
  }
}

export default async function Home() {
  const result = await getData()

  if (!result.success) {
    return <ErrorFallback />
  }

  const formations = (result.formations as any) || []
  const settings = (result.settings as any) || {
    address: "Route Sake, Goma / Nord-Kivu (RDC)",
    phonePrimary: "+243 820 455 153",
    phoneSecondary: "+243 998 781 608",
    email: "contact@tcpsarl.cd",
    webUrl: "www.tcpsarl.cd",
    latitude: -1.5397,
    longitude: 29.0213
  }

  return <HomeClient formations={formations} settings={settings} />
}
