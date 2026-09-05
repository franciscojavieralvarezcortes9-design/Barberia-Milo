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
