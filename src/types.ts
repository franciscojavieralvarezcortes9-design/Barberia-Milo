export interface BarberService {
  id: string;
  name: string;
  priceCLP: number;
  durationMinutes: number;
  description: string;
  image?: string;
  icon?: string;
  badge?: string;
}

export interface ReservationFormData {
  fullName: string;
  service: string;
  date: string;
  time: string;
}

export interface FormErrors {
  fullName?: string;
  service?: string;
  date?: string;
  time?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  tag: string;
}

export type BookingStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface RecordedBooking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  phone?: string;
  priceCLP: number;
  status: BookingStatus;
  createdAt: string;
  source: 'web' | 'manual';
  notes?: string;
}

export interface AdminAnalytics {
  totalVisits: number;
  uniqueVisitors: number;
  totalBookings: number;
  visitsHistory: { date: string; count: number }[];
  bookings: RecordedBooking[];
  lastUpdated: string;
}
