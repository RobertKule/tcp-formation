import { prisma } from "@/lib/prisma"
import { RegistrationForm } from "@/components/registration-form"
import { ErrorFallback } from "@/components/error-boundary"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

export const dynamic = 'force-dynamic'

async function getFormations() {
  try {
    const formations = await prisma.formation.findMany({
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: formations }
  } catch (error) {
    console.error("Erreur Prisma:", error)
    return { success: false, error }
  }
}

export default async function Home() {
  const result = await getFormations()

  if (!result.success) {
    return <ErrorFallback />
  }

  const formations = result.data || []

  return (
    <main className="min-h-screen bg-[#F8F9FA] relative flex flex-col lg:flex-row">
      {/* Navbar / Admin Link */}
      <div className="absolute top-6 right-6 z-10 hidden lg:block">
        <Link href="/admin/login">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 font-medium">
            <Lock className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      </div>

      {/* Left Column: Copy & Value Prop */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 xl:p-24 relative overflow-hidden">
        {/* Subtle Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="max-w-xl z-10">
          {/* Logo TCP */}
          <div className="mb-8">
            <img 
              src="/LogoTCP.jpeg" 
              alt="TCP Formation Logo" 
              className="h-16 lg:h-20 w-auto object-contain"
            />
          </div>
          
          <h1 className="text-[#0B1527] text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Investissez dans votre <span className="text-blue-600">Avenir</span>
          </h1>
          <p className="text-[#4A5568] text-lg lg:text-xl mb-12 max-w-lg leading-relaxed">
            Rejoignez nos programmes intensifs et développez des compétences de pointe pour booster votre carrière.
          </p>

          <div className="space-y-6">
            {[
              "Sélectionnez votre formation idéale",
              "Remplissez vos informations",
              "Finalisez votre inscription"
            ].map((step, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-sm text-[#0B1527] border border-zinc-100">
                  {idx + 1}
                </div>
                <span className="text-[#4A5568] font-medium text-lg">{step}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 lg:hidden">
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="bg-white">
                <Lock className="w-4 h-4 mr-2" />
                Espace Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-[#F8F9FA]">
        <div className="w-full max-w-md xl:max-w-lg relative z-10 w-full perspective-1000">
          <RegistrationForm formations={formations} />
        </div>
      </div>
    </main>
  )
}
