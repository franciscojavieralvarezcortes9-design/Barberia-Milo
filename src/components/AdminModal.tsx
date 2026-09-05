import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Phone,
  CheckCircle,
  Clock,
  Trash2,
  Plus,
  RefreshCw,
  LogOut,
  Scissors,
  Download,
  AlertCircle,
  Search,
  MessageCircle,
} from 'lucide-react';
import {
  getAdminAnalytics,
  verifyAdminCredentials,
  isAdminLoggedIn,
  setAdminSession,
  updateBookingStatus,
  deleteBookingRecord,
  addManualBooking,
  formatCLP,
} from '../adminStore';
import { AdminAnalytics, RecordedBooking, BookingStatus } from '../types';
import { BARBER_SERVICES, TIME_SLOTS } from '../data';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'kpis' | 'bookings' | 'traffic'>('kpis');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual booking modal state
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    clientName: '',
    service: BARBER_SERVICES[0]?.name || 'Corte clásico',
    date: new Date().toISOString().split('T')[0],
    time: '17:00',
    phone: '',
    notes: '',
  });

  // Check existing session
  useEffect(() => {
    if (isOpen) {
      const logged = isAdminLoggedIn();
      setIsAuth(logged);
      if (logged) {
        setAnalytics(getAdminAnalytics());
      }
      setLoginError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(username, password)) {
      setAdminSession(true);
      setIsAuth(true);
      setAnalytics(getAdminAnalytics());
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setAdminSession(false);
    setIsAuth(false);
    setUsername('');
    setPassword('');
  };

  const reloadData = () => {
    setAnalytics(getAdminAnalytics());
  };

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    const updated = updateBookingStatus(id, newStatus);
    setAnalytics({ ...updated });
  };

  const handleDelete = (id: string, clientName: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la reserva de ${clientName}?`)) {
      const updated = deleteBookingRecord(id);
      setAnalytics({ ...updated });
    }
  };

  const handleCreateManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.clientName.trim()) return;

    addManualBooking({
      clientName: manualForm.clientName,
      service: manualForm.service,
      date: manualForm.date,
      time: manualForm.time,
      phone: manualForm.phone || undefined,
      notes: manualForm.notes || undefined,
    });

    setAnalytics(getAdminAnalytics());
    setShowAddManual(false);
    setManualForm({
      clientName: '',
      service: BARBER_SERVICES[0]?.name || 'Corte clásico',
      date: new Date().toISOString().split('T')[0],
      time: '17:00',
      phone: '',
      notes: '',
    });
  };

  const exportCSV = () => {
    if (!analytics || !analytics.bookings) return;
    const headers = ['ID', 'Cliente', 'Servicio', 'Fecha', 'Hora', 'Teléfono', 'Precio CLP', 'Estado', 'Origen'];
    const rows = analytics.bookings.map((b) => [
      b.id,
      `"${b.clientName}"`,
      `"${b.service}"`,
      b.date,
      b.time,
      b.phone || '',
      b.priceCLP,
      b.status,
      b.source,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reservas_milo_studio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter bookings
  const filteredBookings = (analytics?.bookings || []).filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.phone && b.phone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalRevenue = (analytics?.bookings || []).reduce((acc, curr) => {
    return curr.status !== 'cancelada' ? acc + curr.priceCLP : acc;
  }, 0);

  const conversionRate =
    analytics && analytics.totalVisits > 0
      ? ((analytics.totalBookings / analytics.totalVisits) * 100).toFixed(1)
      : '0';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#121212] border border-gold/40 rounded-sm w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-4 sm:px-6 border-b border-white/10 bg-[#161616] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gold-gradient rounded-sm flex items-center justify-center text-black font-extrabold shadow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-display text-white tracking-wide">
                  PANEL DE ADMINISTRACIÓN <span className="text-gold">MILO STUDIO</span>
                </h3>
                {isAuth && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-bold uppercase tracking-wider">
                    Conectado
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#888888]">
                {isAuth
                  ? 'Métricas en tiempo real, clientes visitantes y control de citas agendadas'
                  : 'Ingresa con tus credenciales de administrador'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuth && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-sm bg-[#222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-sm text-[#888888] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!isAuth ? (
            /* Login Form */
            <div className="max-w-md mx-auto py-10 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/40 text-gold flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-display text-white tracking-wider">
                  IDENTIFICACIÓN DE ADMINISTRADOR
                </h4>
                <p className="text-xs text-[#888888]">
                  Panel restringido exclusivamente para el barbero Milo.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 bg-[#181818] p-6 rounded-sm border border-white/10">
                {loginError && (
                  <div className="p-3 rounded-sm bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    Usuario
                  </label>
                  <input
                    type="text"
                    id="admin-username-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#0D0D0D] border border-white/15 focus:border-gold rounded-sm text-sm text-white placeholder-neutral-600 focus:outline-hidden transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="admin-password-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu clave secreta"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#0D0D0D] border border-white/15 focus:border-gold rounded-sm text-sm text-white placeholder-neutral-600 focus:outline-hidden transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer p-1"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-admin-submit-login"
                  className="w-full py-3 gold-gradient text-black font-bold uppercase tracking-wider text-xs rounded-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md mt-2"
                >
                  Entrar al Panel
                </button>
              </form>
            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-6">
              {/* Top Navigation Tabs & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('kpis')}
                    className={`px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'kpis'
                        ? 'gold-gradient text-black shadow-md'
                        : 'bg-[#1C1C1C] text-[#888888] hover:text-white border border-white/5'
                    }`}
                  >
                    Estadísticas & Visitas
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className={`px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'bookings'
                        ? 'gold-gradient text-black shadow-md'
                        : 'bg-[#1C1C1C] text-[#888888] hover:text-white border border-white/5'
                    }`}
                  >
                    <span>Citas Agendadas</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-current font-extrabold">
                      {analytics?.bookings?.length || 0}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={reloadData}
                    className="p-2 rounded-sm bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
                    title="Recargar datos"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddManual(true)}
                    className="px-3 py-1.5 rounded-sm bg-gold/15 hover:bg-gold/25 text-gold border border-gold/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Cita</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="px-3 py-1.5 rounded-sm bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Exportar reservas en CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Real statistics live banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-sm bg-[#161616] border border-gold/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Estadísticas Reales en Vivo (Desde 0)
                  </span>
                  <span className="text-[#888888] hidden sm:inline">
                    — Métricas calculadas únicamente con visitas y reservas reales de tus clientes.
                  </span>
                </div>
                <div className="text-[11px] text-gold font-mono">
                  {analytics?.totalVisits || 0} visitas · {analytics?.totalBookings || 0} citas
                </div>
              </div>

              {/* TAB 1: KPIs & Traffic */}
              {activeTab === 'kpis' && (
                <div className="space-y-6">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Visits */}
                    <div className="p-4 rounded-sm bg-[#181818] border border-white/10 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888]">
                          Clientes Visitantes
                        </span>
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-display text-white">
                          {analytics?.totalVisits || 0}
                        </span>
                        <span className="text-xs text-[#888888]">visitas totales</span>
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400">
                        <strong className="text-emerald-400">{analytics?.uniqueVisitors || 0}</strong> personas únicas han entrado al sitio
                      </div>
                    </div>

                    {/* Bookings */}
                    <div className="p-4 rounded-sm bg-[#181818] border border-white/10 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888]">
                          Personas que Agendaron
                        </span>
                        <Calendar className="w-4 h-4 text-gold" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-display text-gold">
                          {analytics?.totalBookings || 0}
                        </span>
                        <span className="text-xs text-[#888888]">citas reservadas</span>
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400">
                        Tasa de conversión:{' '}
                        <strong className="text-gold">{conversionRate}%</strong> de los visitantes
                      </div>
                    </div>

                    {/* Revenue Estimated */}
                    <div className="p-4 rounded-sm bg-[#181818] border border-white/10 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888]">
                          Ingresos Estimados
                        </span>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-display text-emerald-400">
                          {formatCLP(totalRevenue)}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400">
                        Calculado en base a los servicios solicitados
                      </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="p-4 rounded-sm bg-[#181818] border border-white/10 relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888]">
                          Efectividad Web
                        </span>
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-display text-purple-400">
                          {conversionRate}%
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-400">
                        Excelente flujo directo hacia tu WhatsApp
                      </div>
                    </div>
                  </div>

                  {/* Daily Visits Chart Visualization */}
                  <div className="p-5 rounded-sm bg-[#181818] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Clientes que ingresaron por día (Últimos días)
                        </h4>
                        <p className="text-[11px] text-[#888888]">
                          Volumen diario de visitas en la web de Milo Studio
                        </p>
                      </div>
                      <span className="text-xs text-gold font-semibold">
                        Monitoreo activo
                      </span>
                    </div>

                    {analytics?.visitsHistory && analytics.visitsHistory.length > 0 ? (
                      <div className="h-44 pt-6 pb-2 flex items-end justify-between gap-2 border-b border-white/10">
                        {analytics.visitsHistory.map((item, idx) => {
                          const maxCount = Math.max(...analytics.visitsHistory.map((v) => v.count), 1);
                          const heightPct = Math.max(15, Math.round((item.count / maxCount) * 100));
                          const isToday = item.date === new Date().toISOString().split('T')[0];

                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                              <span className="text-[10px] text-neutral-400 group-hover:text-gold font-bold transition-colors">
                                {item.count}
                              </span>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full max-w-[42px] rounded-t-sm transition-all duration-300 ${
                                  isToday
                                    ? 'gold-gradient shadow-md'
                                    : 'bg-neutral-700 hover:bg-gold/70'
                                }`}
                              />
                              <span className="text-[9px] text-[#888888] tracking-tight truncate w-full text-center">
                                {item.date.slice(5)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-36 flex flex-col items-center justify-center text-center p-4 border-b border-white/10 space-y-2">
                        <TrendingUp className="w-6 h-6 text-gold/60" />
                        <p className="text-xs text-neutral-200 font-semibold">
                          Sin historial previo (Iniciado desde 0)
                        </p>
                        <p className="text-[11px] text-[#888888] max-w-sm">
                          Cada cliente que entre al sitio web se registrará de forma automática aquí día por día.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Services popularity breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-sm bg-[#181818] border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-gold" />
                        <span>Cortes Más Solicitados</span>
                      </h4>
                      {(analytics?.bookings || []).length > 0 ? (
                        <div className="space-y-2.5">
                          {BARBER_SERVICES.map((srv) => {
                            const count = (analytics?.bookings || []).filter((b) => b.service === srv.name).length;
                            const total = analytics?.bookings?.length || 1;
                            const pct = Math.round((count / total) * 100);

                            return (
                              <div key={srv.id} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-neutral-300 font-medium">{srv.name}</span>
                                  <span className="text-gold font-bold">{count} citas ({pct}%)</span>
                                </div>
                                <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full gold-gradient rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-[#888888] space-y-1">
                          <p className="text-neutral-300 font-semibold">0 citas registradas</p>
                          <p className="text-[11px] text-[#777]">
                            A medida que los clientes reserven en la web, se graficarán aquí los cortes más pedidos.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-sm bg-[#181818] border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>Resumen de Estados de Citas</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { status: 'pendiente', label: 'Pendientes', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-500/40' },
                          { status: 'confirmada', label: 'Confirmadas', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-500/40' },
                          { status: 'completada', label: 'Completadas', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-500/40' },
                          { status: 'cancelada', label: 'Canceladas', color: 'text-red-400', bg: 'bg-red-950/40 border-red-500/40' },
                        ].map((st) => {
                          const count = (analytics?.bookings || []).filter((b) => b.status === st.status).length;
                          return (
                            <div key={st.status} className={`p-3 rounded-sm border ${st.bg}`}>
                              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                                {st.label}
                              </div>
                              <div className={`text-xl font-display ${st.color} mt-1`}>
                                {count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Bookings List */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  {/* Filters Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#181818] p-3 rounded-sm border border-white/10">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por cliente, servicio o teléfono..."
                        className="w-full pl-8 pr-3 py-1.5 bg-[#0D0D0D] border border-white/10 rounded-sm text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-gold"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-[#888888] font-semibold mr-1">Filtrar:</span>
                      {['all', 'pendiente', 'confirmada', 'completada', 'cancelada'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                            statusFilter === st
                              ? 'gold-gradient text-black font-bold'
                              : 'bg-[#222] text-[#888888] hover:text-white'
                          }`}
                        >
                          {st === 'all' ? 'Todas' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bookings Table / Cards */}
                  {filteredBookings.length > 0 ? (
                    <div className="space-y-2.5">
                      {filteredBookings.map((bk) => {
                        const statusColors = {
                          pendiente: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
                          confirmada: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
                          completada: 'bg-blue-950/80 border-blue-500/50 text-blue-300',
                          cancelada: 'bg-red-950/80 border-red-500/50 text-red-300',
                        };

                        return (
                          <div
                            key={bk.id}
                            className="p-4 rounded-sm bg-[#161616] border border-white/10 hover:border-gold/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="text-sm font-bold text-white tracking-wide">
                                  {bk.clientName}
                                </h5>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                                    statusColors[bk.status]
                                  }`}
                                >
                                  {bk.status}
                                </span>
                                {bk.source === 'manual' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-white/10">
                                    Manual
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-xs text-[#888888]">
                                <span className="text-gold font-semibold flex items-center gap-1">
                                  <Scissors className="w-3 h-3" />
                                  <span>{bk.service}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-neutral-400" />
                                  <span>{bk.date}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-neutral-400" />
                                  <span>{bk.time} hrs</span>
                                </span>
                                <span className="text-emerald-400 font-medium">
                                  {formatCLP(bk.priceCLP)}
                                </span>
                              </div>

                              {bk.notes && (
                                <p className="text-[11px] text-amber-200/80 italic">
                                  Nota: &ldquo;{bk.notes}&rdquo;
                                </p>
                              )}
                            </div>

                            {/* Actions & Status Control */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {/* WhatsApp Contact if phone available */}
                              {bk.phone && (
                                <a
                                  href={`https://wa.me/${bk.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                    `Hola ${bk.clientName}, te habla Milo de la barbería para confirmar tu turno del ${bk.date} a las ${bk.time} hrs.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 bg-emerald-700/70 hover:bg-emerald-600 text-white rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                  title="Contactar al cliente por WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">WhatsApp</span>
                                </a>
                              )}

                              {/* Status dropdown */}
                              <select
                                value={bk.status}
                                onChange={(e) => handleStatusChange(bk.id, e.target.value as BookingStatus)}
                                className="px-2.5 py-1.5 bg-[#202020] border border-white/15 rounded-sm text-xs text-white focus:outline-hidden focus:border-gold cursor-pointer"
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                              </select>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDelete(bk.id, bk.clientName)}
                                className="p-1.5 rounded-sm bg-[#202020] hover:bg-red-950/80 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors cursor-pointer"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[#888888] bg-[#161616] border border-white/5 rounded-sm">
                      No se encontraron citas agendadas con los filtros actuales.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Booking Creation Sub-Modal */}
      {showAddManual && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-gold/50 rounded-sm max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold" />
                <span>Registrar Cita Manual</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddManual(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#A0A0A0] uppercase mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.clientName}
                  onChange={(e) => setManualForm({ ...manualForm, clientName: e.target.value })}
                  placeholder="Ej: Nicolás Soto"
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/15 rounded-sm text-white focus:outline-hidden focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#A0A0A0] uppercase mb-1">
                  Servicio
                </label>
                <select
                  value={manualForm.service}
                  onChange={(e) => setManualForm({ ...manualForm, service: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/15 rounded-sm text-white focus:outline-hidden focus:border-gold cursor-pointer"
                >
                  {BARBER_SERVICES.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({formatCLP(s.priceCLP)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#A0A0A0] uppercase mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/15 rounded-sm text-white focus:outline-hidden focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A0A0A0] uppercase mb-1">
                    Hora
                  </label>
                  <select
                    value={manualForm.time}
                    onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/15 rounded-sm text-white focus:outline-hidden focus:border-gold cursor-pointer"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t} hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#A0A0A0] uppercase mb-1">
                  Teléfono / WhatsApp (Opcional)
                </label>
                <input
                  type="tel"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  placeholder="+569 1234 5678"
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/15 rounded-sm text-white focus:outline-hidden focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#A0A0A0] uppercase mb-1">
                  Notas / Detalles (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="Detalles sobre el corte o diseño..."
                  className="w-full px-3 py-2 bg-[#0D0D0D] border border-white/15 rounded-sm text-white focus:outline-hidden focus:border-gold resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddManual(false)}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] text-neutral-300 rounded-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 gold-gradient text-black font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-all cursor-pointer shadow-md"
                >
                  Guardar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
