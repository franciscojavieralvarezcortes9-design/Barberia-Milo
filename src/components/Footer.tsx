import React from 'react';
import { MessageCircle, Instagram, MapPin, Clock, Scissors, User } from 'lucide-react';
import {
  SHOP_NAME,
  WHATSAPP_DISPLAY,
  WHATSAPP_PHONE,
  INSTAGRAM_SHOP_URL,
  INSTAGRAM_SHOP_HANDLE,
  INSTAGRAM_MILO_URL,
  INSTAGRAM_MILO_HANDLE,
} from '../data';

interface FooterProps {
  logoPhoto?: string | null;
}

export const Footer: React.FC<FooterProps> = ({ logoPhoto }) => {
  return (
    <footer id="main-footer" className="bg-[#0A0A0A] border-t border-white/10 text-[#888888] text-xs pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              {logoPhoto ? (
                <div className="w-8 h-8 rounded-sm overflow-hidden border border-white/20 bg-black flex items-center justify-center p-0.5">
                  <img
                    src={logoPhoto}
                    alt="Logo Milo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 gold-gradient rounded-sm flex items-center justify-center">
                  <span className="text-black font-extrabold text-sm font-display leading-none">M</span>
                </div>
              )}
              <span className="font-display text-lg text-[#F2F2F2] tracking-widest uppercase">
                {SHOP_NAME}
              </span>
            </div>
            <p className="text-xs text-[#888888] max-w-sm leading-relaxed">
              Barbería moderna con técnica clásica y dedicación personalizada en Rancagua. Especialista en degradados limpios y diseño freestyle.
            </p>

            {/* Social & Contact Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                id="footer-whatsapp-btn"
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A1A1A] text-gold border border-white/10 hover:border-gold transition-all text-xs font-semibold uppercase tracking-wider"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
              </a>

              <a
                id="footer-instagram-shop-btn"
                href={INSTAGRAM_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram oficial de la barbería"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A1A1A] text-[#F2F2F2] hover:text-gold border border-white/10 hover:border-gold transition-all text-xs font-semibold uppercase tracking-wider"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Barbería: {INSTAGRAM_SHOP_HANDLE}</span>
              </a>

              <a
                id="footer-instagram-milo-btn"
                href={INSTAGRAM_MILO_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram personal del barbero Milo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A1A1A] text-[#888888] hover:text-gold border border-white/10 hover:border-gold transition-all text-xs font-semibold uppercase tracking-wider"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Milo Personal: {INSTAGRAM_MILO_HANDLE}</span>
              </a>
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#F2F2F2] tracking-widest uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span>Horarios</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-[#888888]">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Lunes a Sábado</span>
                <span className="text-[#F2F2F2] font-medium">10:00 - 20:00</span>
              </li>
              <li className="flex justify-between text-[#666666]">
                <span>Domingo</span>
                <span>Cerrado</span>
              </li>
            </ul>
          </div>

          {/* Ubicación & Reserva */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#F2F2F2] tracking-widest uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>Rancagua &bull; Chile</span>
            </h4>
            <p className="text-xs text-[#888888] leading-relaxed">
              Atención en estudio privado con estacionamiento y café de cortesía.
            </p>
            <div className="pt-1">
              <a
                href="#reserva"
                className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider"
              >
                <Scissors className="w-3 h-3" />
                <span>Reservar turno online</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sleek Bottom Bar matching theme */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#888888]">
          <div className="uppercase tracking-widest font-medium">
            &copy; {new Date().getFullYear()} {SHOP_NAME} RANCAGUA &bull; TODOS LOS DERECHOS RESERVADOS
          </div>
          <div className="flex flex-wrap items-center space-x-5 uppercase tracking-widest font-semibold">
            <a href={INSTAGRAM_SHOP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              Instagram Barbería
            </a>
            <a href={INSTAGRAM_MILO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              Instagram Milo
            </a>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              WhatsApp
            </a>
            <a href="#hero" className="hover:text-gold transition-colors">
              Subir &uarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
