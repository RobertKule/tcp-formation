import Link from "next/link"
import { Lock, Globe, Mail, Share2 } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0B1527] text-white py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <img 
              src="/LogoTCP.jpeg" 
              alt="TCP Administration Logo" 
              className="h-16 w-auto object-contain brightness-0 invert"
            />
            <p className="text-zinc-400 max-w-sm text-lg leading-relaxed">
              TCP Administration est votre partenaire de confiance pour le développement de compétences technologiques de haut niveau. 
              Une expertise d'entreprise au profit de votre carrière.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Liens Rapides</h3>
            <ul className="space-y-4 text-zinc-400">
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link href="#formations" className="hover:text-white transition-colors">Formations</Link></li>
              <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Espace Admin
              </Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold">Légal</h3>
            <ul className="space-y-4 text-zinc-400">
              <li><Link href="#" className="hover:text-white transition-colors">Mentions Légales</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Conditions Générales</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 text-center text-zinc-500">
          <p>© {currentYear} TCP Administration SARL. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
