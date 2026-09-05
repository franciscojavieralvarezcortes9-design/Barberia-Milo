import { BarberService, GalleryItem } from './types';

export const LOCATION_CITY = 'Rancagua, Chile';

export const BARBER_SERVICES: BarberService[] = [
  {
    id: 'corte-clasico',
    name: 'Corte clásico',
    priceCLP: 10000,
    durationMinutes: 35,
    description: 'Corte a tijera o máquina tradicional, perfilado de patillas y acabado con producto de fijación.',
    badge: 'Popular',
  },
  {
    id: 'corte-nino',
    name: 'Corte niño',
    priceCLP: 8000,
    durationMinutes: 30,
    description: 'Atención con paciencia y buena onda para los más chicos, con estilos frescos y actuales.',
  },
  {
    id: 'diseno-freestyle',
    name: 'Diseño & Freestyle',
    priceCLP: 12000,
    durationMinutes: 45,
    description: 'Líneas a navaja, grecas geométricas, degradado skin fade extremo y arte capilar personalizado.',
    badge: 'Estilo Milo',
  },
];

export const DEFAULT_MILO_PHOTO = '/images/milo.jpg';
export const DEFAULT_LOGO_PHOTO = '/images/logo.jpg';

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'corte-lineas',
    title: 'Fade con doble línea lateral',
    category: 'Degradados & Líneas',
    image: '/images/corte-1.jpg',
    tag: 'Fade Limpio',
  },
  {
    id: 'corte-nuca-cruz',
    title: 'Diseño Freestyle en Nuca con Cruz',
    category: 'Freestyle',
    image: '/images/corte-2.jpg',
    tag: 'Diseño a Navaja',
  },
];

// Generates time slots from 10:00 to 20:00 every 30 minutes
export const TIME_SLOTS: string[] = [
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
];

export const WHATSAPP_PHONE = '56977560843';
export const WHATSAPP_DISPLAY = '+56 9 7756 0843';
export const BARBER_NAME = 'Milo';
export const SHOP_NAME = 'Barbería Milo';

// Instagram links provided by user
export const INSTAGRAM_SHOP_URL = 'https://www.instagram.com/miloxito.barber/';
export const INSTAGRAM_SHOP_HANDLE = '@miloxito.barber';
export const INSTAGRAM_MILO_URL = 'https://www.instagram.com/kz.miloo/';
export const INSTAGRAM_MILO_HANDLE = '@kz.miloo';

