"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react"

interface ContactSectionProps {
  settings: {
    address: string
    phonePrimary: string
    phoneSecondary: string
    email: string
    webUrl: string
    latitude: number
    longitude: number
  }
}

export function ContactSection({ settings }: ContactSectionProps) {
  const mapUrl = `https://www.google.com/maps?q=${settings.latitude},${settings.longitude}&z=15&output=embed`
  const externalMapUrl = `https://www.google.com/maps/dir/?api=1&destination=${settings.latitude},${settings.longitude}`

  return (
    <section id="contact" className="py-32 bg-zinc-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Info Side */}
          <div className="w-full lg:w-1/2 space-y-12">
            <div>
              <h2 className="text-4xl font-extrabold text-[#0B1527] mb-6">TCP Administration : Où nous trouver ?</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                Nos bureaux sont situés au cœur de Goma. N'hésitez pas à nous rendre visite ou à nous contacter par téléphone ou email pour toute question relative à nos formations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-[#0B1527]">Adresse</h3>
                <p className="text-zinc-500 leading-relaxed">{settings.address}</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-[#0B1527]">Téléphone</h3>
                <p className="text-zinc-500">
                  {settings.phonePrimary}<br />
                  {settings.phoneSecondary}
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-[#0B1527]">Email</h3>
                <p className="text-zinc-500">{settings.email}</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-[#0B1527]">Web</h3>
                <p className="text-zinc-500">{settings.webUrl}</p>
              </div>
            </div>

            <a 
              href={externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline group"
            >
              Ouvrir dans Google Maps
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Map Side */}
          <div className="w-full lg:w-1/2 min-h-[400px]">
            <Card className="h-full border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white p-2">
              <CardContent className="p-0 h-full">
                <iframe
                  title="Location Map"
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '2rem' }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
