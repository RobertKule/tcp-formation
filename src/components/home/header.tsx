"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Accueil", href: "#" },
    { name: "Formations", href: "#formations" },
    { name: "Contact", href: "#contact" },
    { name: "Admin", href: "/admin/login" },
  ]

  return (
    <header className={`fixed top-0 left-0 w-full transition-all duration-300 ${
      isScrolled 
        ? "bg-white/80 backdrop-blur-md shadow-sm py-4 lg:bg-white/80" 
        : "bg-transparent py-6 lg:bg-transparent"
    } ${mobileMenuOpen ? "z-[1000]" : "z-[999]"} bg-blue-600 lg:bg-current`}>
      <style jsx>{`
        @media (max-width: 1024px) {
          header {
            background-color: #2563eb !important;
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
            color: white !important;
            position: fixed !important;
            z-index: 999 !important;
          }
        }
      `}</style>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="h-10 lg:h-12 w-auto overflow-hidden rounded-lg bg-white p-1">
            <img 
              src="/LogoTCP.jpeg" 
              alt="TCP Administration Logo" 
              className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <span className="text-xl font-black tracking-tighter text-white lg:text-[#0B1527]">
            TCP <span className="lg:text-blue-600 text-white opacity-90">ADMIN</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-[#4A5568] hover:text-blue-600 font-bold transition-colors text-sm uppercase tracking-widest"
            >
              {link.name}
            </Link>
          ))}
          <Button 
            onClick={() => document.getElementById('registration-card')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 hover:bg-[#0B1527] text-white font-bold rounded-xl px-6 h-11 transition-all hover:scale-105 shadow-lg shadow-blue-200"
          >
            S'inscrire
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </nav>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center space-x-3">
          <Button 
            onClick={() => document.getElementById('registration-card')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-9 px-4 bg-white text-blue-600 font-bold rounded-lg text-xs hover:bg-zinc-100 border-0"
          >
            S'inscrire
          </Button>
          <button 
            className="p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-blue-600 text-white animate-in slide-in-from-left duration-500 flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/20">
            <span className="text-xl font-black tracking-tighter">
              TCP <span className="text-white opacity-80">ADMIN</span>
            </span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2">
              <X className="w-10 h-10" />
            </button>
          </div>
          
          <div className="flex-1 px-8 py-12 space-y-10">
            {navLinks.map((link, idx) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-4xl font-black tracking-tighter hover:text-blue-400 transition-all transform hover:translate-x-4 animate-in fade-in slide-in-from-left-4"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="p-8 border-t border-white/10">
            <Button 
              onClick={() => {
                setMobileMenuOpen(false)
                document.getElementById('registration-card')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xl shadow-2xl transition-transform active:scale-95"
            >
              S'INSCRIRE MAINTENANT
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
