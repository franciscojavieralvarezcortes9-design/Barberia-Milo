import React, { useState, useEffect } from 'react';
import { Calendar, Phone, Menu, X, Instagram, ShieldCheck } from 'lucide-react';
import {
  SHOP_NAME,
  WHATSAPP_DISPLAY,
  WHATSAPP_PHONE,
  INSTAGRAM_SHOP_URL,
  INSTAGRAM_SHOP_HANDLE,
  INSTAGRAM_MILO_URL,
} from '../data';

interface HeaderProps {
  onOpenCodeModal: () => void;
  logoPhoto?: string | null;
  onOpenPhotoUploader?: (tab?: 'milo' | 'logo' | 'gallery') => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCodeModal,
  logoPhoto,
  onOpenPhotoUploader,
  onOpenAdmin,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/80'
          : 'bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        {/* Sleek Brand */}
        <a
          id="header-brand"
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('hero');
          }}
          className="flex items-center space-x-3 group"
        >
          {logoPhoto ? (
            <div className="w-8 h-8 rounded-sm overflow-hidden border border-white/20 bg-black flex items-center justify-center p-0.5">
              <img
                src={logoPhoto}
                alt="Logo Milo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 gold-gradient rounded-sm flex items-center justify-center shadow-sm overflow-hidden">
              <span className="text-black font-extrabold text-lg leading-none font-display">M</span>
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-display tracking-widest text-[#F2F2F2] group-hover:text-[#FFBF00] transition-colors leading-tight">
              {SHOP_NAME}
            </h1>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#888888] font-semibold">
              Rancagua &bull; Chile
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wider uppercase">
          <button
            id="nav-inicio"
            onClick={() => scrollToSection('hero')}
            className="text-[#888888] hover:text-[#FFBF00] transition-colors cursor-pointer"
          >
            Inicio
          </button>
          <button
            id="nav-servicios"
            onClick={() => scrollToSection('servicios')}
            className="text-[#888888] hover:text-[#FFBF00] transition-colors cursor-pointer"
          >
            Servicios
          </button>
          <button
            id="nav-galeria"
            onClick={() => scrollToSection('galeria')}
            className="text-[#888888] hover:text-[#FFBF00] transition-colors cursor-pointer"
          >
            Galería
          </button>
          <button
            id="nav-sobre-milo"
            onClick={() => scrollToSection('sobre-milo')}
            className="text-[#888888] hover:text-[#FFBF00] transition-colors cursor-pointer"
          >
            Milo
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center space-x-3">
          <a
            id="header-instagram-link"
            href={INSTAGRAM_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Oficial @miloxito.barber"
            className="hidden lg:flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#FFBF00] px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-white/5 transition-all"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>{INSTAGRAM_SHOP_HANDLE}</span>
          </a>

          <a
            id="header-phone-link"
            href={`https://wa.me/${WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-2 text-xs text-[#888888] hover:text-[#FFBF00] px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-white/5 transition-all"
          >
            <Phone className="w-3 h-3 text-[#FFBF00]" />
            <span>{WHATSAPP_DISPLAY}</span>
          </a>

          {/* Sleek Reservation Button */}
          <button
            id="header-reservar-btn"
            onClick={() => scrollToSection('reserva')}
            className="px-5 py-2 border border-[#D4AF37] text-[#FFBF00] rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-[#D4AF37] hover:text-black transition-all cursor-pointer flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reservar Ahora</span>
          </button>

          {/* Admin Panel Access Button */}
          {onOpenAdmin && (
            <button
              id="header-admin-btn"
              type="button"
              onClick={onOpenAdmin}
              title="Panel de Administración Milo"
              className="px-3 py-2 rounded-full text-[#888888] hover:text-[#FFBF00] bg-[#161616] hover:bg-[#222222] border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFBF00]" />
              <span className="hidden xl:inline">Admin</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center space-x-2 sm:hidden">
          {onOpenAdmin && (
            <button
              id="header-admin-mobile-direct"
              type="button"
              onClick={onOpenAdmin}
              className="p-1.5 rounded-full text-[#FFBF00] bg-[#161616] border border-[#D4AF37]/40"
              title="Panel de Administración"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}
          <button
            id="header-reservar-mobile-direct"
            onClick={() => scrollToSection('reserva')}
            className="px-3 py-1.5 border border-[#D4AF37] text-[#FFBF00] rounded-full text-[10px] font-bold tracking-wider uppercase hover:bg-[#D4AF37] hover:text-black transition-all"
          >
            Reservar
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#888888] hover:text-white rounded bg-[#1A1A1A] border border-white/10"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="sm:hidden bg-[#0D0D0D] border-b border-white/10 px-4 pt-3 pb-6 space-y-3"
        >
          <button
            onClick={() => scrollToSection('hero')}
            className="block w-full text-left py-2 text-xs uppercase tracking-widest text-[#F2F2F2] hover:text-[#FFBF00] border-b border-white/5 font-semibold"
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToSection('servicios')}
            className="block w-full text-left py-2 text-xs uppercase tracking-widest text-[#F2F2F2] hover:text-[#FFBF00] border-b border-white/5 font-semibold"
          >
            Servicios
          </button>
          <button
            onClick={() => scrollToSection('galeria')}
            className="block w-full text-left py-2 text-xs uppercase tracking-widest text-[#F2F2F2] hover:text-[#FFBF00] border-b border-white/5 font-semibold"
          >
            Galería
          </button>
          <button
            onClick={() => scrollToSection('sobre-milo')}
            className="block w-full text-left py-2 text-xs uppercase tracking-widest text-[#F2F2F2] hover:text-[#FFBF00] border-b border-white/5 font-semibold"
          >
            Barbero Milo
          </button>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => scrollToSection('reserva')}
              className="w-full py-3 gold-gradient text-black font-bold rounded-sm text-xs tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Ahora</span>
            </button>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2.5 text-xs text-gold bg-[#1A1A1A] hover:bg-[#222] border border-gold/30 rounded-sm flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
              >
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>Panel de Administrador</span>
              </button>
            )}

            <a
              href={INSTAGRAM_SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 text-xs text-[#F2F2F2] bg-[#1A1A1A] hover:bg-[#222222] border border-white/10 rounded flex items-center justify-center gap-2 font-medium"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>Instagram: {INSTAGRAM_SHOP_HANDLE}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
