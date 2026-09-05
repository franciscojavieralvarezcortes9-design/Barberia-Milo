import React, { useRef, useState } from 'react';
import { Calendar, Scissors, Sparkles, Clock, CheckCircle2, ShieldCheck, Upload, Award, Camera, Check } from 'lucide-react';
import { BARBER_NAME, SHOP_NAME } from '../data';
import { GalleryItem } from '../types';
import { compressImage } from '../imageCompressor';

interface HeroProps {
  onReserveClick: () => void;
  onExploreServicesClick: () => void;
  miloPhoto?: string | null;
  galleryItems?: GalleryItem[];
  onOpenPhotoUploader?: (tab?: 'milo' | 'logo' | 'gallery') => void;
  onUpdateCutPhoto?: (cutId: string, newImage: string) => void;
  onUpdateMiloPhoto?: (newImage: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onReserveClick,
  onExploreServicesClick,
  miloPhoto,
  galleryItems = [],
  onOpenPhotoUploader,
  onUpdateCutPhoto,
  onUpdateMiloPhoto,
}) => {
  const firstCut = galleryItems[0];
  const secondCut = galleryItems[1];

  const firstCutInputRef = useRef<HTMLInputElement | null>(null);
  const secondCutInputRef = useRef<HTMLInputElement | null>(null);
  const miloInputRef = useRef<HTMLInputElement | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCutChange = async (cutId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    showFeedback('Optimizando y colocando foto...');
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      if (onUpdateCutPhoto) {
        onUpdateCutPhoto(cutId, compressed);
      }
      showFeedback('¡Foto del corte actualizada y guardada!');
    } catch (err) {
      console.error(err);
      // Fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (onUpdateCutPhoto && typeof reader.result === 'string') {
          onUpdateCutPhoto(cutId, reader.result);
          showFeedback('¡Foto del corte actualizada!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMiloChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    showFeedback('Optimizando foto de Milo...');
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      if (onUpdateMiloPhoto) {
        onUpdateMiloPhoto(compressed);
      }
      showFeedback('¡Foto de Milo actualizada y guardada!');
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = () => {
        if (onUpdateMiloPhoto && typeof reader.result === 'string') {
          onUpdateMiloPhoto(reader.result);
          showFeedback('¡Foto de Milo actualizada!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="hero" className="relative min-h-[85vh] flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-10 bg-[#0D0D0D] overflow-hidden">
      {/* Sleek Radial Glow & Vignette */}
      <div className="absolute inset-0 z-0">
        {miloPhoto && (
          <img
            src={miloPhoto}
            alt={`Barbero ${BARBER_NAME}`}
            className="w-full h-full object-cover object-[center_20%] opacity-20 filter contrast-125"
          />
        )}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/90 to-[#0D0D0D]/40 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-7 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A1A] border border-white/10 mb-4">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-gold text-[11px] font-bold tracking-[0.25em] uppercase">
              Estilo &bull; Precisión &bull; {SHOP_NAME}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display text-[#F2F2F2] leading-none uppercase mb-5">
            CORTES CON <br />
            <span className="text-gold">IDENTIDAD.</span>
          </h1>

          <p className="text-[#888888] max-w-lg text-sm sm:text-base leading-relaxed mb-8">
            Especialista en degradados limpios, cortes modernos y diseño freestyle en Rancagua. Asesoría de imagen personalizada y técnica de alto nivel por <strong className="text-[#F2F2F2] font-semibold">{BARBER_NAME}</strong>.
          </p>

          {/* Sleek Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              id="hero-reservar-cta"
              onClick={onReserveClick}
              className="gold-gradient text-black font-bold py-3.5 px-8 rounded-sm text-xs tracking-widest uppercase hover:opacity-95 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <Calendar className="w-4 h-4 text-black" />
              <span>Reservar Ahora</span>
            </button>

            <button
              id="hero-ver-servicios-btn"
              onClick={onExploreServicesClick}
              className="py-3.5 px-7 rounded-sm bg-[#1A1A1A] hover:bg-[#222222] text-[#F2F2F2] border border-white/10 hover:border-gold font-semibold text-xs tracking-widest uppercase transition-all flex items-center gap-2 cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-[#FFBF00]" />
              <span>Ver Servicios</span>
            </button>

            {onOpenPhotoUploader && (!miloPhoto || galleryItems.length === 0) && (
              <button
                onClick={onOpenPhotoUploader}
                className="py-3.5 px-5 rounded-sm bg-[#151515] hover:bg-[#1A1A1A] text-gold border border-gold/40 text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Fotos Reales</span>
              </button>
            )}
          </div>

          {/* Sleek Trust Markers */}
          <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-[10px] text-[#888888] uppercase tracking-wider mb-0.5">Ubicación</div>
              <div className="text-xs font-medium text-[#F2F2F2]">Rancagua, Chile</div>
            </div>
            <div>
              <div className="text-[10px] text-[#888888] uppercase tracking-wider mb-0.5">Atención</div>
              <div className="text-xs font-medium text-[#F2F2F2]">10:00 a 20:00 hrs</div>
            </div>
            <div>
              <div className="text-[10px] text-[#888888] uppercase tracking-wider mb-0.5">Confirmación</div>
              <div className="text-xs font-medium text-gold">Directa por WhatsApp</div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview Cards */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center gap-3">
          {feedbackMsg && (
            <div className="px-3 py-1.5 bg-black/90 border border-gold text-gold text-xs font-semibold rounded-sm shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {miloPhoto || galleryItems.length > 0 ? (
            <div className="flex items-center gap-4">
              {/* If real cut photos exist */}
              {galleryItems.length > 0 && (
                <div className="space-y-4">
                  {firstCut && (
                    <div
                      id="hero-cut-card-1"
                      className="w-36 sm:w-40 h-36 sm:h-40 rounded-lg bg-neutral-900 border border-white/10 hover:border-gold/60 overflow-hidden shadow-2xl relative group transition-all"
                    >
                      <img
                        src={firstCut.image}
                        alt={firstCut.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {secondCut && (
                    <div
                      id="hero-cut-card-2"
                      className="w-36 sm:w-40 h-36 sm:h-40 rounded-lg bg-neutral-900 border border-white/10 hover:border-gold/60 overflow-hidden shadow-2xl relative group transition-all"
                    >
                      <img
                        src={secondCut.image}
                        alt={secondCut.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Milo photo card */}
              {miloPhoto && (
                <div
                  id="hero-milo-card"
                  className="w-44 sm:w-48 h-60 sm:h-64 rounded-lg bg-neutral-900 border border-gold/40 hover:border-gold overflow-hidden shadow-2xl relative group transition-all"
                >
                  <img
                    src={miloPhoto}
                    alt="Milo Barbero"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                    <span className="text-gold text-[10px] uppercase font-bold tracking-widest">Master Barber</span>
                    <span className="text-base font-display text-white">{BARBER_NAME}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Premium Barber Badge Card when photos not yet loaded */
            <div className="w-full max-w-sm bg-[#151515] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="w-12 h-12 gold-gradient rounded-sm flex items-center justify-center text-black font-extrabold text-2xl font-display">
                  M
                </div>
                <div className="text-right">
                  <span className="text-xs font-display text-gold uppercase tracking-wider block">
                    Barbería Exclusiva
                  </span>
                  <span className="text-[10px] text-[#888888] tracking-widest uppercase">
                    Calidad & Detalle
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-2.5 bg-[#111111] rounded-sm border border-white/5">
                  <Scissors className="w-4 h-4 text-gold shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Degradados Skin Fade</span>
                    <span className="text-[10px] text-[#888888]">Transiciones limpias al milímetro</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#111111] rounded-sm border border-white/5">
                  <Sparkles className="w-4 h-4 text-gold shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Perfilado a Navaja</span>
                    <span className="text-[10px] text-[#888888]">Líneas limpias y toalla caliente</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-[#111111] rounded-sm border border-white/5">
                  <Award className="w-4 h-4 text-gold shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-white block">Atención Personalizada</span>
                    <span className="text-[10px] text-[#888888]">Directamente con el Barbero Milo</span>
                  </div>
                </div>
              </div>

              {onOpenPhotoUploader && (
                <button
                  onClick={() => onOpenPhotoUploader('gallery')}
                  className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#222222] border border-gold/30 hover:border-gold text-gold text-xs font-semibold rounded-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar Fotos Reales</span>
                </button>
              )}
            </div>
          )}

          {/* Hidden file inputs for direct changes */}
          {firstCut && (
            <input
              ref={firstCutInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleCutChange(firstCut.id, e.target.files[0]);
                }
                e.target.value = '';
              }}
            />
          )}

          {secondCut && (
            <input
              ref={secondCutInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleCutChange(secondCut.id, e.target.files[0]);
                }
                e.target.value = '';
              }}
            />
          )}

          <input
            ref={miloInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleMiloChange(e.target.files[0]);
              }
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </section>
  );
};
