import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { AboutMilo } from './components/AboutMilo';
import { Gallery } from './components/Gallery';
import { BookingSection } from './components/BookingSection';
import { Footer } from './components/Footer';
import { StandaloneModal } from './components/StandaloneModal';
import { PhotoUploaderModal } from './components/PhotoUploaderModal';
import { AdminModal } from './components/AdminModal';
import { MessageCircle, Calendar } from 'lucide-react';
import { WHATSAPP_PHONE } from './data';
import { useRealImages } from './imageStore';
import { recordSiteVisit } from './adminStore';
import { GalleryItem } from './types';

export default function App() {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [photoUploaderTab, setPhotoUploaderTab] = useState<'milo' | 'logo' | 'gallery'>('gallery');
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Track site visits automatically
  useEffect(() => {
    recordSiteVisit();
  }, []);

  const {
    miloPhoto,
    logoPhoto,
    galleryItems,
    hasCustomChanges,
    saveMiloPhoto,
    updateGalleryItem,
    removeGalleryItem,
  } = useRealImages();

  const handleOpenPhotoUploader = (tab: 'milo' | 'logo' | 'gallery' = 'gallery') => {
    setEditingItem(null);
    setPhotoUploaderTab(tab);
    setIsPhotoUploaderOpen(true);
  };

  const handleEditGalleryItem = (item: GalleryItem) => {
    setEditingItem(item);
    setPhotoUploaderTab('gallery');
    setIsPhotoUploaderOpen(true);
  };

  const scrollToBooking = (serviceName?: string) => {
    if (serviceName) {
      setSelectedService(serviceName);
    }
    const bookingEl = document.getElementById('reserva');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const servicesEl = document.getElementById('servicios');
    if (servicesEl) {
      servicesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2F2F2] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Sleek Navigation Header */}
      <Header
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        logoPhoto={logoPhoto}
        onOpenPhotoUploader={handleOpenPhotoUploader}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <Hero
          onReserveClick={() => scrollToBooking()}
          onExploreServicesClick={scrollToServices}
          miloPhoto={miloPhoto}
          galleryItems={galleryItems}
          onOpenPhotoUploader={handleOpenPhotoUploader}
          onUpdateCutPhoto={(id, newImg) => updateGalleryItem(id, { image: newImg })}
          onUpdateMiloPhoto={(newImg) => saveMiloPhoto(newImg)}
        />

        {/* 2. Services & Pricing Section with Sleek Border-Left Cards */}
        <Services onSelectService={(svc) => scrollToBooking(svc)} />

        {/* 3. About Milo Barbero */}
        <AboutMilo
          onReserveClick={() => scrollToBooking()}
          miloPhoto={miloPhoto}
          onOpenPhotoUploader={handleOpenPhotoUploader}
          onUpdateMiloPhoto={(newImg) => saveMiloPhoto(newImg)}
        />

        {/* 4. Gallery Section */}
        <Gallery
          items={galleryItems}
          hasCustomChanges={hasCustomChanges}
          onOpenPhotoUploader={() => handleOpenPhotoUploader('gallery')}
          onEditItem={handleEditGalleryItem}
          onUpdateItemPhoto={(id, newImg) => updateGalleryItem(id, { image: newImg })}
          onDeleteItem={(id) => removeGalleryItem(id)}
        />

        {/* 5. Reservation & WhatsApp Confirmation Section */}
        <BookingSection selectedServicePreload={selectedService} />
      </main>

      {/* Sleek Footer */}
      <Footer logoPhoto={logoPhoto} />

      {/* Floating Quick Action */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        <button
          id="floating-reserve-pill"
          onClick={() => scrollToBooking()}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full gold-gradient text-black font-bold text-xs tracking-wider uppercase shadow-xl hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-black" />
          <span>Agendar Hora</span>
        </button>

        <a
          id="floating-whatsapp-btn"
          href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hola Barbero Milo, quisiera consultar disponibilidad para un corte en Rancagua.')}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Hablar directo por WhatsApp con Milo"
          className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all group"
          aria-label="Contactar a Milo por WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
        </a>
      </div>

      {/* Standalone Code Modal */}
      <StandaloneModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Real Photos Uploader / Editor Modal */}
      <PhotoUploaderModal
        isOpen={isPhotoUploaderOpen}
        onClose={() => {
          setIsPhotoUploaderOpen(false);
          setEditingItem(null);
        }}
        defaultTab={photoUploaderTab}
        initialEditingItem={editingItem}
      />

      {/* Secret Admin Analytics & Bookings Dashboard */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
