import React, { useState } from 'react';
import { Scissors, Award, Sparkles, MessageCircle, Upload, User, Instagram, Camera, Check } from 'lucide-react';
import { BARBER_NAME, SHOP_NAME, WHATSAPP_DISPLAY, WHATSAPP_PHONE } from '../data';
import { compressImage } from '../imageCompressor';

interface AboutMiloProps {
  onReserveClick: () => void;
  miloPhoto?: string | null;
  onOpenPhotoUploader?: (tab?: 'milo' | 'logo' | 'gallery') => void;
  onUpdateMiloPhoto?: (newImage: string) => void;
}

export const AboutMilo: React.FC<AboutMiloProps> = ({
  onReserveClick,
  miloPhoto,
  onOpenPhotoUploader,
  onUpdateMiloPhoto,
}) => {
  const [toast, setToast] = useState<string | null>(null);

  const handleMiloPhotoChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    setToast('Optimizando y actualizando foto de Milo...');
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      if (onUpdateMiloPhoto) {
        onUpdateMiloPhoto(compressed);
      }
      setToast('¡Foto de Milo cambiada y guardada con éxito!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (onUpdateMiloPhoto) onUpdateMiloPhoto(reader.result);
          setToast('¡Foto de Milo actualizada!');
          setTimeout(() => setToast(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <section id="sobre-milo" className="py-20 bg-[#0D0D0D] border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Photo Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm lg:max-w-none">
              <div className="relative rounded-sm overflow-hidden border border-white/10 bg-[#141414] aspect-4/5 shadow-2xl flex flex-col justify-end group">
                {miloPhoto ? (
                  <img
                    src={miloPhoto}
                    alt={`Barbero ${BARBER_NAME}`}
                    className="w-full h-full object-cover object-top filter contrast-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#1C1C1C] to-[#121212]">
                    <div className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center text-black mb-4 shadow-xl">
                      <Scissors className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-display uppercase text-[#F2F2F2] tracking-wider">
                      {BARBER_NAME}
                    </h3>
                    <p className="text-xs text-gold font-semibold uppercase tracking-widest mt-1">
                      Barbero Titular
                    </p>
                    <p className="text-[11px] text-[#888888] max-w-xs mt-3 leading-relaxed">
                      Rancagua, Chile &bull; Especialista en Degradados & Estilos Personalizados
                    </p>
                    {onOpenPhotoUploader && (
                      <button
                        onClick={() => onOpenPhotoUploader('milo')}
                        className="mt-5 px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] text-gold border border-gold/40 text-xs font-semibold rounded-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto Real de Milo</span>
                      </button>
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                {/* Sleek Floating Info */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-sm bg-[#1A1A1A]/95 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-sm tracking-wider text-[#F2F2F2]">
                      {BARBER_NAME} &bull; BARBERO TITULAR
                    </h4>
                    <p className="text-[11px] text-gold font-semibold uppercase tracking-wider mt-0.5">
                      Especialista en Degradados & Freestyle
                    </p>
                  </div>
                  <div className="w-8 h-8 gold-gradient rounded-sm flex items-center justify-center text-black">
                    <Scissors className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text & Story Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block mb-2">
                Conoce a tu Barbero &bull; Experiencia Milo
              </span>
              <h2 className="font-display text-3xl sm:text-5xl text-[#F2F2F2] leading-none uppercase">
                PASIÓN, DETALLE & <br />
                <span className="text-gold">ARTE BARBERO.</span>
              </h2>
            </div>

            <p className="text-[#888888] text-sm sm:text-base leading-relaxed">
              Hola, soy <strong>Milo</strong>. En <strong>{SHOP_NAME}</strong> creo que un corte de cabello no es solo rutina: es confianza, actitud y pulcritud. Me enfoco en escuchar exactamente lo que buscas para esculpir el estilo que mejor favorezca tus facciones y personalidad.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-sm bg-[#1A1A1A] border-l-2 border-l-gold border-t border-r border-b border-white/5">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Degradados Pulcros</span>
                </div>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Desvanecidos limpios desde la piel (Skin Fade, Low/Mid/High Fade) con transiciones perfectas y perfilado nítido.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-[#1A1A1A] border-l-2 border-l-gold border-t border-r border-b border-white/5">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider mb-1">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Diseños & Freestyle</span>
                </div>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Líneas a navaja, cruces y figuras geométricas personalizadas para que tu corte tenga sello propio.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="btn-sobre-milo-reservar"
                onClick={onReserveClick}
                className="gold-gradient text-black font-bold py-3.5 px-7 rounded-sm text-xs tracking-widest uppercase hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                Agendar con Milo
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-sm bg-[#1A1A1A] hover:bg-[#222222] text-[#F2F2F2] hover:text-gold text-xs font-semibold uppercase tracking-wider border border-white/10 hover:border-gold flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              <a
                id="btn-milo-instagram-shop"
                href="https://www.instagram.com/miloxito.barber/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram de Barbería Miloxito"
                className="py-3 px-4 rounded-sm bg-[#1A1A1A] hover:bg-[#222222] text-[#F2F2F2] hover:text-gold text-xs font-semibold uppercase tracking-wider border border-white/10 hover:border-gold flex items-center gap-2 transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>@miloxito.barber</span>
              </a>

              <a
                id="btn-milo-instagram-personal"
                href="https://www.instagram.com/kz.miloo/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram personal de Milo"
                className="py-3 px-4 rounded-sm bg-[#1A1A1A] hover:bg-[#222222] text-[#888888] hover:text-gold text-xs font-semibold uppercase tracking-wider border border-white/10 hover:border-gold flex items-center gap-2 transition-all"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>@kz.miloo</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
