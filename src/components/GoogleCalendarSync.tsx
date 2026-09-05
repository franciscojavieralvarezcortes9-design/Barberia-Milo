import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Clock,
  MapPin,
  LogOut,
  RefreshCw,
  Scissors,
} from 'lucide-react';
import {
  initCalendarAuth,
  googleCalendarSignIn,
  googleCalendarSignOut,
  createCalendarEvent,
  listUpcomingCalendarEvents,
  deleteCalendarEvent,
  GoogleCalendarEventOutput,
  getCalendarAccessToken,
} from '../googleCalendar';
import { GoogleSignInButton } from './GoogleSignInButton';
import { BARBER_SERVICES } from '../data';

interface GoogleCalendarSyncProps {
  bookingData?: {
    fullName: string;
    service: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
  };
  onEventCreated?: (event: GoogleCalendarEventOutput) => void;
}

export const GoogleCalendarSync: React.FC<GoogleCalendarSyncProps> = ({
  bookingData,
  onEventCreated,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<GoogleCalendarEventOutput[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<GoogleCalendarEventOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Mandatory confirmation dialog for mutating/destructive operations
  const [eventToDelete, setEventToDelete] = useState<GoogleCalendarEventOutput | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
        setUpcomingEvents([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch upcoming events when token is ready
  const fetchEvents = useCallback(async () => {
    const currentToken = await getCalendarAccessToken();
    if (!currentToken) return;

    setIsLoadingEvents(true);
    try {
      const events = await listUpcomingCalendarEvents();
      setUpcomingEvents(events);
    } catch (err: any) {
      console.warn('Could not fetch calendar events:', err.message);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      fetchEvents();
    }
  }, [token, user, fetchEvents]);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleCalendarSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        fetchEvents();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google Calendar.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    try {
      await googleCalendarSignOut();
      setUser(null);
      setToken(null);
      setUpcomingEvents([]);
      setCreatedEvent(null);
      setSuccessMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cerrar sesión.');
    }
  };

  // Convert booking date and time to ISO strings
  const getEventTimeWindow = (dateStr: string, timeStr: string, durationMinutes = 45) => {
    // Expected dateStr: "YYYY-MM-DD", timeStr: "HH:MM"
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    // Format ISO string with Chile offset or local
    return {
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
    };
  };

  // Handle adding current booking to Google Calendar
  const handleAddToCalendar = async () => {
    if (!bookingData || !bookingData.date || !bookingData.time) {
      setErrorMsg('Faltan datos de la reserva para crear el evento.');
      return;
    }

    if (!token) {
      await handleSignIn();
      return;
    }

    setIsCreatingEvent(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Find service duration
      const matchedService = BARBER_SERVICES.find((s) => s.name === bookingData.service);
      const duration = matchedService ? matchedService.durationMinutes : 45;

      const { startIso, endIso } = getEventTimeWindow(
        bookingData.date,
        bookingData.time,
        duration
      );

      const event = await createCalendarEvent({
        summary: `Barbería Milo • ${bookingData.service} (${bookingData.fullName})`,
        description: `Cita confirmada en Barbería Milo Studio Rancagua.\n\nCliente: ${bookingData.fullName}\nServicio: ${bookingData.service}\nDuración: ${duration} minutos\nBarbero: Milo\nContacto WhatsApp: +569 7756 0843\n\nPor favor presentarse con 5 minutos de anticipación en el estudio.`,
        startIso,
        endIso,
        location: 'Rancagua, Chile • Estudio Privado Miloxito Barber',
      });

      setCreatedEvent(event);
      setSuccessMsg('¡Cita sincronizada con éxito en tu Google Calendar!');
      if (onEventCreated) onEventCreated(event);
      fetchEvents();
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo sincronizar la cita con Google Calendar.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Handle deleting event with explicit confirmation
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await deleteCalendarEvent(eventToDelete.id);
      setSuccessMsg('Cita eliminada de tu Google Calendar.');
      setEventToDelete(null);
      if (createdEvent?.id === eventToDelete.id) {
        setCreatedEvent(null);
      }
      fetchEvents();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar el evento de Google Calendar.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Auth / Account Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-black/60 border border-white/10 rounded-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-white p-1 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Google Calendar</span>
              {user && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-medium">
                  Conectado
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#888888]">
              {user ? user.email : 'Sincroniza y recibe recordatorios en tu calendario'}
            </p>
          </div>
        </div>

        <div>
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-[11px] text-[#888888] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-white/5 transition-all cursor-pointer"
              title="Desconectar cuenta de Google"
            >
              <LogOut className="w-3 h-3" />
              <span>Desconectar</span>
            </button>
          ) : (
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isLoggingIn}
              text="Conectar Google Calendar"
            />
          )}
        </div>
      </div>

      {/* Booking Sync Action Card */}
      {bookingData && bookingData.date && bookingData.time && (
        <div className="p-4 rounded-sm bg-gradient-to-r from-[#1A1A1A] to-[#141414] border border-gold/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold block">
                Agendamiento en Calendario
              </span>
              <h5 className="text-sm font-bold text-white mt-0.5">
                {createdEvent ? '¡Cita Guardada en tu Google Calendar!' : '¿Deseas agregar esta cita a tu Google Calendar?'}
              </h5>
              <p className="text-xs text-[#888888] mt-1">
                Incluye recordatorios automáticos 2 horas y 30 minutos antes para que no olvides tu turno.
              </p>
            </div>
            <CalendarIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          </div>

          {createdEvent ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-200 font-medium">
                  {createdEvent.summary}
                </span>
              </div>
              {createdEvent.htmlLink && (
                <a
                  href={createdEvent.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <span>Ver en Google Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              {user ? (
                <button
                  type="button"
                  id="btn-sync-google-calendar"
                  onClick={handleAddToCalendar}
                  disabled={isCreatingEvent}
                  className="px-5 py-2.5 gold-gradient text-black font-bold text-xs uppercase tracking-wider rounded-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{isCreatingEvent ? 'Guardando en Calendar...' : 'Guardar en Google Calendar'}</span>
                </button>
              ) : (
                <GoogleSignInButton
                  onClick={handleAddToCalendar}
                  isLoading={isLoggingIn || isCreatingEvent}
                  text="Iniciar sesión y Guardar en Calendar"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-sm text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && !createdEvent && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-sm text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* List of user's upcoming appointments in Google Calendar */}
      {user && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-widest text-[#888888] font-bold flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-gold" />
              <span>Tus Citas Agendadas en Google Calendar</span>
            </span>
            <button
              type="button"
              onClick={fetchEvents}
              disabled={isLoadingEvents}
              className="text-[10px] text-[#888888] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Actualizar eventos"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingEvents ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {isLoadingEvents ? (
            <div className="p-4 text-center text-xs text-[#888888] bg-[#141414] border border-white/5 rounded-sm">
              Cargando citas de tu Google Calendar...
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {upcomingEvents.map((evt) => {
                const startRaw = evt.start?.dateTime || evt.start?.date;
                const formattedDate = startRaw
                  ? new Date(startRaw).toLocaleString('es-CL', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Fecha por confirmar';

                return (
                  <div
                    key={evt.id}
                    className="p-3 bg-[#161616] hover:bg-[#1A1A1A] border border-white/5 rounded-sm flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        <Scissors className="w-3 h-3 text-gold shrink-0" />
                        <span className="truncate">{evt.summary}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#888888]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{formattedDate}</span>
                        </span>
                        {evt.location && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-gold" />
                            <span className="truncate">{evt.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded bg-[#202020] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white border border-white/5 transition-all"
                          title="Abrir en Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setEventToDelete(evt)}
                        className="p-1.5 rounded bg-[#202020] hover:bg-red-950/80 text-neutral-400 hover:text-red-400 border border-white/5 hover:border-red-500/40 transition-all cursor-pointer"
                        title="Eliminar cita de Google Calendar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-[#888888] bg-[#141414] border border-white/5 rounded-sm">
              No tienes citas próximas de Milo registradas en tu Google Calendar.
            </div>
          )}
        </div>
      )}

      {/* MANDATORY User Confirmation Dialog for Destructive Operation (Deleting Event) */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-red-500/40 rounded-sm max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  ¿Eliminar cita de Google Calendar?
                </h4>
                <p className="text-xs text-[#888888] mt-0.5">
                  Esta acción eliminará el evento directamente de tu cuenta de Google.
                </p>
              </div>
            </div>

            <div className="p-3 bg-black/50 border border-white/5 rounded-sm space-y-1 text-xs">
              <div className="font-semibold text-white">{eventToDelete.summary}</div>
              <div className="text-[#888888]">
                {eventToDelete.start?.dateTime
                  ? new Date(eventToDelete.start.dateTime).toLocaleString('es-CL')
                  : 'Fecha'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-sm bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar cita'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
