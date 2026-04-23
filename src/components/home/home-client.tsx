"use client"

import { useState } from "react"
import { RegistrationForm } from "@/components/registration-form"
import { Header } from "@/components/home/header"
import { FormationsSection } from "@/components/home/formations-section"
import { ContactSection } from "@/components/home/contact-section"
import { Footer } from "@/components/home/footer"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface HomeClientProps {
  formations: any[]
  settings: any
}

export function HomeClient({ formations, settings }: HomeClientProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  const handleSelectFormation = (id: string) => {
    setSelectedId(id)
  }

  return (
    <div className="flex flex-col min-h-screen scroll-smooth">
      <Header />
      
      {/* Hero Section */}
      <main className="min-h-screen bg-[#F8F9FA] relative flex flex-col lg:flex-row pt-20">
        {/* Left Column: Copy & Value Prop */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16 xl:p-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="max-w-xl z-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <img src="/LogoTCP.jpeg" alt="TCP Logo" className="h-16 lg:h-20 w-auto mb-8 rounded-xl shadow-sm" />
            <h1 className="text-[#0B1527] text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-8">
              L'Elite de <br/>
              <span className="text-blue-600">L'Administration</span>
            </h1>
            <p className="text-[#4A5568] text-xl lg:text-2xl mb-12 max-w-lg leading-relaxed font-medium">
              TCP Administration vous propulse vers l'excellence. Une expertise d'entreprise au service de votre formation.
            </p>

            <div className="space-y-6">
              {[
                "Expertise d'entreprise reconnue",
                "Formations pratiques de terrain",
                "Certification TCP de haut niveau"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 shadow-lg shadow-blue-200 flex items-center justify-center font-bold text-sm text-white">
                    ✓
                  </div>
                  <span className="text-[#4A5568] font-bold text-lg uppercase tracking-tight">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div id="registration-card" className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-[#F8F9FA]">
          <div className="w-full max-w-md xl:max-w-lg relative z-10 w-full perspective-1000 animate-in fade-in zoom-in-95 duration-500 delay-200">
            <RegistrationForm formations={formations} selectedId={selectedId} />
          </div>
        </div>
      </main>

      <FormationsSection formations={formations} onSelect={handleSelectFormation} />
      <ContactSection settings={settings} />
      <Footer />
    </div>
  )
}
