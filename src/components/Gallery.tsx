import React, { useState } from 'react';
import { Camera, Eye, X, Upload, Scissors, Plus, Pencil, CheckCircle, Check, Trash2 } from 'lucide-react';
import { GalleryItem } from '../types';
import { compressImage } from '../imageCompressor';

interface GalleryProps {
  items: GalleryItem[];
  hasCustomChanges?: boolean;
  onOpenPhotoUploader?: () => void;
  onEditItem?: (item: GalleryItem) => void;
  onUpdateItemPhoto?: (id: string, newImage: string) => void;
  onDeleteItem?: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({
  items,
  hasCustomChanges,
  onOpenPhotoUploader,
  onEditItem,
  onUpdateItemPhoto,
  onDeleteItem,
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteCard = (itemId: string, title?: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${title || 'esta foto'}" de la galería?`)) {
      if (onDeleteItem) {
        onDeleteItem(itemId);
      }
      if (selectedImage && selectedImage.id === itemId) {
        setSelectedImage(null);
      }
      showToast('Foto eliminada correctamente.');
    }
  };

  const handleCardFileChange = async (itemId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    showToast('Optimizando y guardando foto del corte...');
    try {
      const compressed = await compressImage(file, 1200, 1200, 0.85);
      if (onUpdateItemPhoto) {
        onUpdateItemPhoto(itemId, compressed);
      }
      if (selectedImage && selectedImage.id === itemId) {
        setSelectedImage({ ...selectedImage, image: compressed });
      }
      showToast('¡Foto del corte cambiada y guardada con éxito!');
    } catch (err) {
      console.error(err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (onUpdateItemPhoto) onUpdateItemPhoto(itemId, reader.result);
          if (selectedImage && selectedImage.id === itemId) {
            setSelectedImage({ ...selectedImage, image: reader.result });
          }
          showToast('¡Foto del corte cambiada!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="galeria" className="py-20 bg-[#0D0D0D] relative border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Sleek Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 mb-10 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#888888]">
              Portafolio Milo Studio &bull; Trabajos Auténticos en Rancagua
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-[#F2F2F2] mt-1">
              GALERÍA DE <span className="text-gold">CORTES REALES</span>
            </h2>
          </div>
        </div>

        {/* Notification Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 px-4 py-2 bg-black/95 border border-gold text-gold text-xs font-semibold rounded-sm shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Gallery Content */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                id={`gallery-item-${index + 1}`}
                onClick={() => setSelectedImage(item)}
                className="group relative rounded-sm overflow-hidden bg-[#1A1A1A] border border-white/10 hover:border-gold cursor-pointer aspect-4/3 transition-all duration-300 shadow-lg hover:-translate-y-1"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4" />

                {/* Tag in corner */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-sm bg-black/85 border border-white/10 text-gold text-[10px] font-bold uppercase tracking-widest">
                    {item.tag}
                  </span>
                </div>

                {/* Hover Details */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 sm:translate-y-4 sm:group-hover:translate-y-0 transition-transform duration-300 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gold font-bold block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="font-display text-sm text-[#F2F2F2] tracking-wider uppercase truncate max-w-[200px]">
                      {item.title}
                    </h4>
                  </div>

                  <div className="w-8 h-8 rounded-sm gold-gradient text-black flex items-center justify-center shadow opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state inviting real photos */
          <div className="py-16 px-6 bg-[#131313] border border-white/10 rounded-sm text-center max-w-2xl mx-auto shadow-xl">
            <div className="w-14 h-14 rounded-full bg-[#1C1C1C] border border-white/10 text-gold flex items-center justify-center mx-auto mb-4">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-display text-xl uppercase tracking-wider text-white mb-2">
              Galería Lista para tus Fotos Reales
            </h3>
            <p className="text-xs text-[#888888] leading-relaxed max-w-md mx-auto mb-6">
              Sube tus fotos de degradados, perfilados y diseños reales en Rancagua para que tus clientes vean tu trabajo auténtico tal cual.
            </p>
            {onOpenPhotoUploader && (
              <button
                onClick={onOpenPhotoUploader}
                className="gold-gradient text-black font-bold py-3 px-6 rounded-sm text-xs tracking-widest uppercase hover:opacity-90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Upload className="w-4 h-4 text-black" />
                <span>Cargar Fotos de Trabajos de Milo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sleek Lightbox Modal */}
      {selectedImage && (
        <div
          id="gallery-lightbox"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#1A1A1A] rounded-sm overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="gallery-lightbox-close"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-sm bg-black/80 text-[#888888] hover:text-white border border-white/10 transition-all cursor-pointer"
              aria-label="Cerrar modal de imagen"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="max-h-[72vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D0D0D] border-t border-white/10">
              <div>
                <span className="text-[10px] font-bold text-gold uppercase tracking-widest block">
                  {selectedImage.category} &bull; {selectedImage.tag}
                </span>
                <h3 className="font-display text-lg text-[#F2F2F2] uppercase mt-0.5">
                  {selectedImage.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#reserva"
                  onClick={() => setSelectedImage(null)}
                  className="gold-gradient text-black font-bold px-4 py-2 rounded-sm text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
                >
                  Pedir este corte
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
