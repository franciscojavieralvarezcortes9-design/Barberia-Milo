import React from 'react';
import { Clock, Scissors, ArrowRight, Check, Sparkles, Flame, Shield, Award, Smile } from 'lucide-react';
import { BARBER_SERVICES } from '../data';
import { BarberService } from '../types';

interface ServicesProps {
  onSelectService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'corte-clasico':
        return <Scissors className="w-5 h-5 text-gold" />;
      case 'corte-barba':
        return <Sparkles className="w-5 h-5 text-gold" />;
      case 'afeitado-navaja':
        return <Flame className="w-5 h-5 text-gold" />;
      case 'diseno-barba':
        return <Shield className="w-5 h-5 text-gold" />;
      case 'corte-nino':
        return <Smile className="w-5 h-5 text-gold" />;
      case 'diseno-freestyle':
      default:
        return <Award className="w-5 h-5 text-gold" />;
    }
  };

  return (
    <section id="servicios" className="py-20 bg-[#0D0D0D] relative border-t border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Sleek Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 mb-10 gap-2">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#888888]">
              Nuestros Servicios &bull; Milo Estudio
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-[#F2F2F2] mt-1">
              TARIFAS & <span className="text-gold">EXPERIENCIA</span>
            </h2>
          </div>
          <span className="text-xs text-gold font-semibold tracking-wider uppercase">
            Valores en CLP &bull; Atención Rancagua
          </span>
        </div>

        {/* Services Grid with Sleek Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BARBER_SERVICES.map((service: BarberService) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className="service-card-sleek group rounded-sm overflow-hidden flex flex-col justify-between p-5 bg-[#151515] border border-white/10 hover:border-gold/50 transition-all duration-300"
            >
              {/* Header block for the service */}
              <div className="mb-4">
                {service.image ? (
                  <div className="relative h-44 w-full overflow-hidden rounded-sm bg-black mb-4">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-sm bg-[#111111] border border-white/5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-sm bg-[#1C1C1C] border border-white/10 flex items-center justify-center">
                        {getServiceIcon(service.id)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#888888]">
                        <Clock className="w-3 h-3 text-gold" />
                        <span>~{service.durationMinutes} min</span>
                      </div>
                    </div>
                    {service.badge && (
                      <span className="px-2 py-0.5 rounded-sm bg-[#FFBF00] text-black text-[9px] font-extrabold uppercase tracking-wider shadow">
                        {service.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Information */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base sm:text-lg tracking-wider uppercase text-[#F2F2F2] group-hover:text-gold transition-colors">
                      {service.name}
                    </h3>
                    <span className="text-base font-bold text-gold whitespace-nowrap font-mono">
                      {formatCLP(service.priceCLP)}
                    </span>
                  </div>
                  <p className="text-xs text-[#888888] leading-relaxed mt-2 font-normal">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <button
                    id={`btn-select-${service.id}`}
                    onClick={() => onSelectService(service.name)}
                    className="w-full py-2.5 px-3 rounded-sm bg-[#111111] hover:bg-[#D4AF37] text-[#888888] hover:text-black border border-white/10 hover:border-[#D4AF37] font-semibold text-xs tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Elegir y Reservar</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sleek bottom note */}
        <div className="mt-8 p-3.5 rounded-sm bg-[#1A1A1A] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888888]">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Medios de pago: Efectivo, Transferencia electrónica, Débito y Crédito.</span>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-[#666666]">
            Higiene certificada y esterilización UV para cada servicio
          </span>
        </div>
      </div>
    </section>
  );
};
