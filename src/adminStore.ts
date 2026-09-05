import { AdminAnalytics, RecordedBooking, BookingStatus } from './types';
import { BARBER_SERVICES } from './data';

const STORAGE_KEY = 'miloxito_barber_admin_analytics_real_v2';
const ADMIN_SESSION_KEY = 'miloxito_barber_admin_session_v1';
const VISITOR_SESSION_KEY = 'miloxito_barber_visitor_flag_v1';

// Formatted Chilean currency
export const formatCLP = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Initial clean data strictly starting from zero
const getInitialAnalytics = (): AdminAnalytics => {
  return {
    totalVisits: 0,
    uniqueVisitors: 0,
    totalBookings: 0,
    visitsHistory: [],
    bookings: [],
    lastUpdated: new Date().toISOString(),
  };
};

export const getAdminAnalytics = (): AdminAnalytics => {
  try {
    // Clear out old mock key if exists
    if (localStorage.getItem('miloxito_barber_admin_analytics_v1')) {
      localStorage.removeItem('miloxito_barber_admin_analytics_v1');
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAnalytics();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading admin analytics:', err);
    return getInitialAnalytics();
  }
};

export const resetAnalyticsToZero = (): AdminAnalytics => {
  const zeroState = getInitialAnalytics();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zeroState));
  sessionStorage.removeItem(VISITOR_SESSION_KEY);
  return zeroState;
};

export const saveAdminAnalytics = (data: AdminAnalytics): void => {
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving admin analytics:', err);
  }
};

/**
 * Automatically records page view and unique visitor
 */
export const recordSiteVisit = (): AdminAnalytics => {
  const analytics = getAdminAnalytics();
  const isNewVisitor = !sessionStorage.getItem(VISITOR_SESSION_KEY);

  analytics.totalVisits += 1;
  if (isNewVisitor) {
    analytics.uniqueVisitors += 1;
    sessionStorage.setItem(VISITOR_SESSION_KEY, 'true');
  }

  // Update today's visit history
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIndex = analytics.visitsHistory.findIndex((v) => v.date === todayStr);
  if (todayIndex >= 0) {
    analytics.visitsHistory[todayIndex].count += 1;
  } else {
    analytics.visitsHistory.push({ date: todayStr, count: 1 });
    if (analytics.visitsHistory.length > 14) {
      analytics.visitsHistory.shift();
    }
  }

  saveAdminAnalytics(analytics);
  return analytics;
};

/**
 * Records a new booking submitted from the website
 */
export const recordNewBooking = (params: {
  clientName: string;
  service: string;
  date: string;
  time: string;
  phone?: string;
  notes?: string;
}): RecordedBooking => {
  const analytics = getAdminAnalytics();

  // Find price
  const matchedService = BARBER_SERVICES.find((s) => s.name === params.service);
  const priceCLP = matchedService ? matchedService.priceCLP : 10000;

  const newBooking: RecordedBooking = {
    id: `booking-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    clientName: params.clientName.trim(),
    service: params.service,
    date: params.date,
    time: params.time,
    phone: params.phone,
    priceCLP,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
    source: 'web',
    notes: params.notes,
  };

  analytics.totalBookings += 1;
  analytics.bookings.unshift(newBooking);

  saveAdminAnalytics(analytics);
  return newBooking;
};

/**
 * Update booking status (e.g. Pendiente -> Confirmada -> Completada -> Cancelada)
 */
export const updateBookingStatus = (
  id: string,
  newStatus: BookingStatus
): AdminAnalytics => {
  const analytics = getAdminAnalytics();
  const booking = analytics.bookings.find((b) => b.id === id);
  if (booking) {
    booking.status = newStatus;
    saveAdminAnalytics(analytics);
  }
  return analytics;
};

/**
 * Delete a booking record
 */
export const deleteBookingRecord = (id: string): AdminAnalytics => {
  const analytics = getAdminAnalytics();
  analytics.bookings = analytics.bookings.filter((b) => b.id !== id);
  if (analytics.totalBookings > 0) {
    analytics.totalBookings -= 1;
  }
  saveAdminAnalytics(analytics);
  return analytics;
};

/**
 * Add manual booking by the Admin
 */
export const addManualBooking = (params: {
  clientName: string;
  service: string;
  date: string;
  time: string;
  phone?: string;
  priceCLP?: number;
  notes?: string;
}): RecordedBooking => {
  const analytics = getAdminAnalytics();
  const matchedService = BARBER_SERVICES.find((s) => s.name === params.service);
  const priceCLP = params.priceCLP || (matchedService ? matchedService.priceCLP : 10000);

  const newBooking: RecordedBooking = {
    id: `booking-manual-${Date.now()}`,
    clientName: params.clientName.trim(),
    service: params.service,
    date: params.date,
    time: params.time,
    phone: params.phone,
    priceCLP,
    status: 'confirmada',
    createdAt: new Date().toISOString(),
    source: 'manual',
    notes: params.notes,
  };

  analytics.totalBookings += 1;
  analytics.bookings.unshift(newBooking);
  saveAdminAnalytics(analytics);
  return newBooking;
};

/**
 * Admin Credentials Verification
 * Credentials requested by user:
 * Usuario: Milo14
 * Clave: 14
 */
export const verifyAdminCredentials = (user: string, pass: string): boolean => {
  // Credentials strictly verified
  return user.trim() === 'Milo14' && pass.trim() === '14';
};

export const isAdminLoggedIn = (): boolean => {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminSession = (loggedIn: boolean): void => {
  try {
    if (loggedIn) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (err) {
    console.error('Error updating admin session:', err);
  }
};
