import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, MessageCircle, AlertCircle, CheckCircle, ExternalLink, RefreshCw, MapPin } from 'lucide-react';
import { BARBER_SERVICES, TIME_SLOTS, WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '../data';
import { FormErrors, ReservationFormData } from '../types';

interface BookingSectionProps {
  selectedServicePreload?: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ selectedServicePreload }) => {
  const [formData, setFormData] = useState<ReservationFormData>({
    fullName: '',
    service: selectedServicePreload || '',
    date: '',
    time: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState('');

  // Sync when user selects a service from cards
  useEffect(() => {
    if (selectedServicePreload) {
      setFormData((prev) => ({ ...prev, service: selectedServicePreload }));
      if (errors.service) {
        setErrors((prev) => ({ ...prev, service: undefined }));
      }
    }
  }, [selectedServicePreload]);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDate = getTodayDateString();

  const formatDateForMessage = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Por favor ingresa tu nombre completo.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Ingresa un nombre de al menos 3 caracteres.';
    }

    if (!formData.service) {
      newErrors.service = 'Por favor selecciona el servicio deseado.';
    }

    if (!formData.date) {
      newErrors.date = 'Por favor selecciona una fecha.';
    } else if (formData.date < minDate) {
      newErrors.date = 'No es posible seleccionar una fecha pasada.';
    }

    if (!formData.time) {
      newErrors.time = 'Por favor elige un horario disponible.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const formattedDate = formatDateForMessage(formData.date);
    // Exact prompt requested format:
    // "Hola Barbero Milo mi nombre es {nombre} y quiero {servicio} voy a llegar el {fecha} a las {hora} hs. Ahí estaré."
    const message = `Hola Barbero Milo mi nombre es ${formData.fullName.trim()} y quiero ${formData.service} voy a llegar el ${formattedDate} a las ${formData.time} hs. Ahí estaré.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

    setSubmittedMessage(message);
    setSubmittedUrl(whatsappUrl);
    setIsSubmitted(true);

    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // Handled gracefully by the visible button
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedUrl('');
    setSubmittedMessage('');
    setFormData({
      fullName: '',
      service: '',
      date: '',
      time: '',
    });
    setErrors({});
  };

  return (
    <section id="reserva" className="bg-[#0D0D0D] px-4 sm:px-6 lg:px-10 py-16 border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (Sleek info panel) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block">
              Agendamiento Directo
            </span>
            <h3 className="text-3xl sm:text-4xl font-display text-[#F2F2F2] uppercase leading-none">
              RESERVA <br />
              <span className="text-gold">TU HORA</span>
            </h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Selecciona tu servicio y horario. Al confirmar tu solicitud, se generará el mensaje oficial para coordinar tu llegada directamente por WhatsApp con Milo.
            </p>

            <div className="mt-6 p-4 rounded-sm bg-[#1A1A1A] border border-white/5 space-y-3">
              <div>
                <div className="text-[10px] text-[#888888] uppercase tracking-widest mb-0.5">Ubicación</div>
                <div className="text-xs font-medium text-[#F2F2F2] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>Rancagua, Chile &bull; Estudio Privado</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] text-[#888888] uppercase tracking-widest mb-0.5">WhatsApp Directo</div>
                <div className="text-xs font-bold text-gold flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{WHATSAPP_DISPLAY}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] text-[#888888] uppercase tracking-widest mb-0.5">Horarios</div>
                <div className="text-xs text-[#F2F2F2]">Lunes a Sábado: 10:00 a 20:00 hrs</div>
              </div>
            </div>
          </div>

          {/* Right Column: Form / Success state */}
          <div className="lg:col-span-8 bg-[#1A1A1A]/90 border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl">
            {isSubmitted ? (
              <div id="booking-confirmation-banner" className="py-6 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-display text-2xl text-[#F2F2F2] uppercase tracking-wide">
                    ¡Listo! Te estamos redirigiendo a WhatsApp
                  </h4>
                  <p className="text-xs text-[#888888] max-w-md mx-auto">
                    Se abrirá la conversación con <strong className="text-gold">Milo</strong> para confirmar tu turno. Si no abrió automáticamente, haz clic abajo:
                  </p>
                </div>

                {/* Message preview */}
                <div className="p-3.5 rounded-sm bg-black/60 border border-white/10 text-left max-w-lg mx-auto">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888] block mb-1">
                    Mensaje generado:
                  </span>
                  <p className="text-xs text-amber-200/90 font-mono italic">
                    &ldquo;{submittedMessage}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    id="btn-whatsapp-redirect-manual"
                    href={submittedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Abrir Chat de WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    id="btn-new-reservation"
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-[#F2F2F2] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Nueva Reserva</span>
                  </button>
                </div>
              </div>
            ) : (
              <form id="reservation-form" onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-[10px] uppercase tracking-widest text-[#888888] font-bold block">
                      Nombre Completo <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Tu nombre y apellido"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                      }}
                      className={`w-full bg-[#111111] border ${
                        errors.fullName ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:ring-1 focus:ring-gold focus:border-gold'
                      } rounded-sm p-3 text-sm outline-none text-[#F2F2F2] transition-all`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-1.5">
                    <label htmlFor="service" className="text-[10px] uppercase tracking-widest text-[#888888] font-bold block">
                      Servicio Deseado <span className="text-gold">*</span>
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={(e) => {
                        setFormData({ ...formData, service: e.target.value });
                        if (errors.service) setErrors({ ...errors, service: undefined });
                      }}
                      className={`w-full bg-[#111111] border ${
                        errors.service ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:ring-1 focus:ring-gold focus:border-gold'
                      } rounded-sm p-3 text-sm outline-none text-[#F2F2F2] transition-all cursor-pointer`}
                    >
                      <option value="" disabled className="bg-[#111111] text-[#888888]">
                        -- Elige un servicio --
                      </option>
                      {BARBER_SERVICES.map((s) => (
                        <option key={s.id} value={s.name} className="bg-[#111111] text-[#F2F2F2]">
                          {s.name} &bull; ${s.priceCLP.toLocaleString('es-CL')} CLP
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.service}</span>
                      </p>
                    )}
                  </div>

                  {/* Date Picker */}
                  <div className="space-y-1.5">
                    <label htmlFor="date" className="text-[10px] uppercase tracking-widest text-[#888888] font-bold block">
                      Fecha de la Cita <span className="text-gold">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      min={minDate}
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        if (errors.date) setErrors({ ...errors, date: undefined });
                      }}
                      className={`w-full bg-[#111111] border ${
                        errors.date ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:ring-1 focus:ring-gold focus:border-gold'
                      } rounded-sm p-3 text-sm outline-none text-[#F2F2F2] transition-all cursor-pointer`}
                    />
                    {errors.date && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.date}</span>
                      </p>
                    )}
                  </div>

                  {/* Time dropdown / indicator */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[#888888] font-bold block">
                      Hora Seleccionada <span className="text-gold">*</span>
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => {
                        setFormData({ ...formData, time: e.target.value });
                        if (errors.time) setErrors({ ...errors, time: undefined });
                      }}
                      className={`w-full bg-[#111111] border ${
                        errors.time ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:ring-1 focus:ring-gold focus:border-gold'
                      } rounded-sm p-3 text-sm outline-none text-[#F2F2F2] transition-all cursor-pointer`}
                    >
                      <option value="" disabled className="bg-[#111111] text-[#888888]">
                        -- Elige un horario --
                      </option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot} className="bg-[#111111] text-[#F2F2F2]">
                          {slot} hrs
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Time Slots Grid */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">
                      Bloques rápidos (10:00 - 20:00)
                    </span>
                    {formData.time && (
                      <span className="text-[11px] text-gold font-bold uppercase tracking-wider">
                        {formData.time} hrs
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-sm bg-[#111111] border border-white/5">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = formData.time === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          id={`time-slot-${slot.replace(':', '')}`}
                          onClick={() => {
                            setFormData({ ...formData, time: slot });
                            if (errors.time) setErrors({ ...errors, time: undefined });
                          }}
                          className={`py-1.5 px-1 text-[11px] font-medium rounded-sm transition-all text-center cursor-pointer ${
                            isSelected
                              ? 'gold-gradient text-black font-extrabold shadow'
                              : 'bg-[#1A1A1A] hover:bg-[#262626] text-[#888888] hover:text-white border border-white/5'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {errors.time && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.time}</span>
                    </p>
                  )}
                </div>

                {/* Submit button matching Sleek theme */}
                <div className="pt-3">
                  <button
                    type="submit"
                    id="btn-confirmar-reserva"
                    className="w-full gold-gradient text-black font-bold py-4 rounded-sm text-xs tracking-widest uppercase hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <MessageCircle className="w-4 h-4 fill-black" />
                    <span>Confirmar y Enviar WhatsApp</span>
                  </button>
                  <p className="text-[10px] text-center text-[#888888] mt-2 uppercase tracking-wider">
                    Conexión directa vía WhatsApp oficial (+569 7756 0843)
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
