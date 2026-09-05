import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  User,
  Scissors,
  CheckCircle,
  Save,
  Pencil,
  RotateCcw,
  Plus,
  ArrowLeft,
  Link,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { useRealImages } from '../imageStore';
import { GalleryItem } from '../types';
import { compressImage } from '../imageCompressor';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'milo' | 'logo' | 'gallery';
  initialEditingItem?: GalleryItem | null;
}

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'gallery',
  initialEditingItem = null,
}) => {
  const {
    miloPhoto,
    logoPhoto,
    galleryItems,
    hasCustomChanges,
    saveMiloPhoto,
    saveLogoPhoto,
    addGalleryItem,
    updateGalleryItem,
    removeGalleryItem,
    resetToDefaults,
  } = useRealImages();

  const [copiedCode, setCopiedCode] = useState(false);

  const [activeTab, setActiveTab] = useState<'milo' | 'logo' | 'gallery'>(defaultTab);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(initialEditingItem);

  // Edit fields for gallery item
  const [itemImage, setItemImage] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('Degradados & Líneas');
  const [itemTag, setItemTag] = useState('Fade Limpio');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Milo / Logo draft state
  const [miloDraft, setMiloDraft] = useState<string | null>(null);
  const [logoDraft, setLogoDraft] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize initial state when modal opens or initialEditingItem changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      if (initialEditingItem) {
        setEditingItem(initialEditingItem);
        setItemImage(initialEditingItem.image);
        setItemTitle(initialEditingItem.title);
        setItemCategory(initialEditingItem.category);
        setItemTag(initialEditingItem.tag);
      } else {
        setEditingItem(null);
        setItemImage('');
        setItemTitle('');
        setItemCategory('Degradados & Líneas');
        setItemTag('Fade Limpio');
      }
      setMiloDraft(null);
      setLogoDraft(null);
      setUrlInput('');
      setShowUrlInput(false);
    }
  }, [isOpen, defaultTab, initialEditingItem]);

  if (!isOpen) return null;

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStartEditItem = (item: GalleryItem) => {
    setEditingItem(item);
    setItemImage(item.image);
    setItemTitle(item.title);
    setItemCategory(item.category);
    setItemTag(item.tag);
    setShowUrlInput(false);
    setUrlInput('');
  };

  const handleCancelEditItem = () => {
    setEditingItem(null);
    setItemImage('');
    setItemTitle('');
    setItemCategory('Degradados & Líneas');
    setItemTag('Fade Limpio');
    setShowUrlInput(false);
    setUrlInput('');
  };

  const [isCompressing, setIsCompressing] = useState(false);

  // Global clipboard paste listener inside modal
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          handleFileUpload(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, activeTab, editingItem, itemCategory, itemTag]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'info');
      return;
    }

    setIsCompressing(true);
    showToast('Procesando y guardando imagen con máxima calidad...', 'info');

    try {
      // Compress and optimize image to ensure it fits safely in storage and renders sharp
      const optimizedDataUrl = await compressImage(file, 1200, 1200, 0.85);

      if (activeTab === 'milo') {
        setMiloDraft(optimizedDataUrl);
        saveMiloPhoto(optimizedDataUrl);
        showToast('¡Foto de Milo cambiada y guardada con éxito en tu web!');
      } else if (activeTab === 'logo') {
        setLogoDraft(optimizedDataUrl);
        saveLogoPhoto(optimizedDataUrl);
        showToast('¡Logo cambiado y guardado con éxito en tu web!');
      } else {
        setItemImage(optimizedDataUrl);
        if (editingItem) {
          updateGalleryItem(editingItem.id, { image: optimizedDataUrl });
          showToast('¡Foto del corte actualizada y guardada de inmediato!');
        } else {
          const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Nuevo Corte Real';
          addGalleryItem({
            image: optimizedDataUrl,
            title: defaultTitle,
            category: itemCategory || 'Degradados & Líneas',
            tag: itemTag || 'Corte Milo',
          });
          showToast('¡Foto agregada y guardada de inmediato en la galería!');
          setItemTitle('');
          setItemImage('');
        }
      }
    } catch (err) {
      console.error('Error al procesar la imagen:', err);
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = () => {
        const rawUrl = reader.result as string;
        if (activeTab === 'milo') {
          setMiloDraft(rawUrl);
          saveMiloPhoto(rawUrl);
          showToast('¡Foto de Milo guardada!');
        } else if (activeTab === 'logo') {
          setLogoDraft(rawUrl);
          saveLogoPhoto(rawUrl);
          showToast('¡Logo guardado!');
        } else {
          setItemImage(rawUrl);
          if (editingItem) {
            updateGalleryItem(editingItem.id, { image: rawUrl });
            showToast('¡Foto actualizada!');
          } else {
            addGalleryItem({
              image: rawUrl,
              title: file.name.replace(/\.[^/.]+$/, '') || 'Nuevo Corte Real',
              category: itemCategory || 'Degradados & Líneas',
              tag: itemTag || 'Corte Milo',
            });
            showToast('¡Foto agregada!');
            setItemTitle('');
            setItemImage('');
          }
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();

    if (activeTab === 'milo') {
      setMiloDraft(url);
      saveMiloPhoto(url);
      showToast('¡Enlace de foto de Milo guardado y aplicado!');
    } else if (activeTab === 'logo') {
      setLogoDraft(url);
      saveLogoPhoto(url);
      showToast('¡Enlace de logo guardado y aplicado!');
    } else {
      setItemImage(url);
      if (editingItem) {
        updateGalleryItem(editingItem.id, { image: url });
        showToast('¡Enlace de imagen actualizado y guardado!');
      } else {
        addGalleryItem({
          image: url,
          title: itemTitle.trim() || 'Nuevo Corte Real',
          category: itemCategory || 'Degradados & Líneas',
          tag: itemTag || 'Corte Milo',
        });
        showToast('¡Foto agregada y guardada de inmediato en la galería!');
        setItemImage('');
        setItemTitle('');
      }
    }
    setUrlInput('');
    setShowUrlInput(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // SAVE ACTIONS
  const handleSaveGalleryItem = () => {
    if (!itemImage) {
      alert('Por favor selecciona o sube una imagen primero.');
      return;
    }

    const finalTitle = itemTitle.trim() || 'Corte Real Milo';
    const finalCat = itemCategory.trim() || 'Degradados';
    const finalTag = itemTag.trim() || 'Estilo Milo';

    if (editingItem) {
      updateGalleryItem(editingItem.id, {
        image: itemImage,
        title: finalTitle,
        category: finalCat,
        tag: finalTag,
      });
      showToast('¡Imagen guardada con éxito! Permanecerá siempre guardada en la web.');
      setEditingItem(null);
      setItemImage('');
      setItemTitle('');
    } else {
      addGalleryItem({
        image: itemImage,
        title: finalTitle,
        category: finalCat,
        tag: finalTag,
      });
      showToast('¡Nueva foto agregada y guardada permanentemente en la galería!');
      setItemImage('');
      setItemTitle('');
    }
  };

  const handleSaveMiloPhoto = () => {
    if (miloDraft) {
      saveMiloPhoto(miloDraft);
      setMiloDraft(null);
      showToast('¡Foto de Milo guardada permanentemente en tu web!');
    }
  };

  const handleSaveLogoPhoto = () => {
    if (logoDraft) {
      saveLogoPhoto(logoDraft);
      setLogoDraft(null);
      showToast('¡Logo oficial guardado permanentemente en tu web!');
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      miloPhoto,
      logoPhoto,
      galleryItems,
      exportDate: new Date().toISOString(),
      shop: 'Barbería Milo Rancagua',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo-fotos-milo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Respaldo descargado con éxito.');
  };

  const handleCopyPhotosCode = () => {
    const backupData = {
      miloPhoto,
      logoPhoto,
      galleryItems,
      savedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(backupData);
    navigator.clipboard
      .writeText(jsonStr)
      .then(() => {
        setCopiedCode(true);
        showToast('¡Datos de fotos copiados! Puedes pegarlos aquí en el chat para integrarlos permanentemente.');
        setTimeout(() => setCopiedCode(false), 4000);
      })
      .catch(() => {
        showToast('No se pudo copiar automáticamente al portapapeles. Usa "Descargar Respaldo".', 'info');
      });
  };

  return (
    <div
      id="photo-uploader-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-[#0D0D0D] border border-white/20 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gold-gradient rounded-sm flex items-center justify-center text-black font-bold shadow-md">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base text-[#F2F2F2] tracking-wider uppercase">
                Editor de Imágenes & Portafolio
              </h3>
              <p className="text-[11px] text-[#888888] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edita cualquier foto y guárdala para que siempre esté aquí</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-white rounded-sm hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#111111] text-xs">
          <button
            id="tab-gallery"
            onClick={() => {
              setActiveTab('gallery');
              setEditingItem(null);
            }}
            className={`flex-1 py-3 font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'gallery'
                ? 'text-gold border-b-2 border-gold bg-[#1A1A1A]'
                : 'text-[#888888] hover:text-[#F2F2F2]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Galería de Cortes ({galleryItems.length})</span>
          </button>

          <button
            id="tab-milo"
            onClick={() => setActiveTab('milo')}
            className={`flex-1 py-3 font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'milo'
                ? 'text-gold border-b-2 border-gold bg-[#1A1A1A]'
                : 'text-[#888888] hover:text-[#F2F2F2]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Foto de Milo</span>
          </button>

          <button
            id="tab-logo"
            onClick={() => setActiveTab('logo')}
            className={`flex-1 py-3 font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'logo'
                ? 'text-gold border-b-2 border-gold bg-[#1A1A1A]'
                : 'text-[#888888] hover:text-[#F2F2F2]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo Oficial</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Permanent Save Status Box */}
          <div className="p-3 bg-[#161616] border border-emerald-500/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#E0E0E0]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-300">Tus fotos editadas y agregadas quedan guardadas permanentemente.</strong>
                <span className="text-[#888888] hidden sm:inline"> Se cargan automáticamente cada vez que visitas o recargas la página.</span>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                {galleryItems.length} fotos activas
              </span>
            </div>
          </div>

          {/* Notification Toast Banner */}
          {notification && (
            <div
              className={`p-3 rounded-sm text-xs flex items-center justify-between border ${
                notification.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                  : 'bg-amber-950/70 border-amber-500/60 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{notification.msg}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-white/60 hover:text-white cursor-pointer ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: GALLERY OF CUTS */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Form box for Adding or Editing an item */}
              <div className="p-4 sm:p-5 bg-[#141414] border border-gold/30 rounded-sm space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    {editingItem ? (
                      <>
                        <Pencil className="w-4 h-4 text-gold" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                          Editando Foto: <span className="text-gold">{editingItem.title}</span>
                        </h4>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-gold" />
                        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                          Agregar / Editar Nueva Foto de Corte
                        </h4>
                      </>
                    )}
                  </div>
                  {editingItem && (
                    <button
                      onClick={handleCancelEditItem}
                      className="text-xs text-[#888888] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Cancelar edición</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Image preview & upload column */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="w-full aspect-4/3 bg-black border border-white/20 rounded-sm overflow-hidden relative group">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#888888]">
                          <Scissors className="w-8 h-8 text-gold mb-2" />
                          <span className="text-xs">Sin imagen seleccionada</span>
                        </div>
                      )}

                      {/* Overlay upload button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-gold transition-opacity cursor-pointer p-2"
                      >
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold uppercase">Cambiar Imagen</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5 w-full">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-[#222222] hover:bg-[#2a2a2a] text-white rounded-sm text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-gold" />
                        <span>Subir archivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="py-2 px-3 bg-[#222222] hover:bg-[#2a2a2a] text-[#888888] hover:text-white rounded-sm text-xs border border-white/10 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Pegar enlace de imagen"
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>URL</span>
                      </button>
                    </div>

                    {showUrlInput && (
                      <div className="mt-2 w-full flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="https://ejemplo.com/foto.jpg"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-sm p-1.5 text-xs text-white outline-none focus:border-gold"
                        />
                        <button
                          onClick={handleApplyUrl}
                          className="px-2.5 py-1.5 gold-gradient text-black font-bold text-xs rounded-sm cursor-pointer"
                        >
                          OK
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata fields column */}
                  <div className="md:col-span-7 space-y-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#AAAAAA] font-bold block mb-1">
                        Título del corte / trabajo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Fade con doble línea lateral"
                        value={itemTitle}
                        onChange={(e) => setItemTitle(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#AAAAAA] font-bold block mb-1">
                          Categoría
                        </label>
                        <select
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-gold"
                        >
                          <option value="Degradados & Líneas">Degradados & Líneas</option>
                          <option value="Freestyle">Freestyle & Diseños</option>
                          <option value="Corte Clásico">Corte Clásico</option>
                          <option value="Corte Infantil">Corte Infantil</option>
                          <option value="Barbero Titular">Barbero Titular</option>
                          <option value="Identidad de Marca">Identidad de Marca</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#AAAAAA] font-bold block mb-1">
                          Etiqueta (Badge)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Fade Limpio, Estilo Milo"
                          value={itemTag}
                          onChange={(e) => setItemTag(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm p-2.5 text-xs text-[#F2F2F2] outline-none focus:border-gold"
                        />
                      </div>
                    </div>

                    {/* Action Button: SAVE PERMANENTLY */}
                    <div className="pt-2">
                      <button
                        id="btn-save-gallery-item"
                        onClick={handleSaveGalleryItem}
                        className="w-full gold-gradient text-black font-black py-3 px-4 rounded-sm text-xs uppercase tracking-widest hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <Save className="w-4 h-4" />
                        <span>
                          {editingItem
                            ? '💾 Guardar Cambios en Esta Foto'
                            : '💾 Guardar y Publicar en la Galería'}
                        </span>
                      </button>
                      <p className="text-[10px] text-[#888888] text-center mt-1.5">
                        Al presionar guardar, la foto queda registrada de forma permanente en tu navegador.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* List of current gallery items to edit/delete */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                    Fotos actuales en la galería ({galleryItems.length}) &bull; Haz clic en &ldquo;Editar&rdquo; para modificar cualquier foto
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`relative rounded-sm overflow-hidden border ${
                        editingItem?.id === item.id ? 'border-gold ring-2 ring-gold/40' : 'border-white/10'
                      } bg-[#141414] p-2.5 flex flex-col justify-between space-y-2`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-sm bg-black overflow-hidden shrink-0 border border-white/10">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-gold font-bold block truncate">
                            {item.category}
                          </span>
                          <h5 className="text-xs font-semibold text-white truncate">{item.title}</h5>
                          <span className="text-[10px] text-[#888888] inline-block mt-0.5 px-1.5 py-0.2 bg-[#222222] rounded-sm">
                            {item.tag}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleStartEditItem(item)}
                          className="py-1 px-2.5 rounded-sm bg-[#222222] hover:bg-[#2c2c2c] text-gold text-[11px] font-semibold flex items-center gap-1 border border-gold/30 hover:border-gold transition-all cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la foto "${item.title}"?`)) {
                              removeGalleryItem(item.id);
                              if (editingItem?.id === item.id) {
                                handleCancelEditItem();
                              }
                              showToast('Foto eliminada de la galería.');
                            }
                          }}
                          className="p-1 text-[#888888] hover:text-red-400 hover:bg-white/5 rounded-sm transition-colors cursor-pointer"
                          title="Eliminar de galería"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MILO'S PHOTO */}
          {activeTab === 'milo' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#141414] border border-white/10 rounded-sm space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-gold" />
                    <span>Foto de Milo (Barbero Titular)</span>
                  </h4>
                  <span className="text-xs text-gold font-semibold uppercase">
                    Se muestra en portada y Sobre Milo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Current/Preview Photo */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="w-40 h-52 bg-black border-2 border-gold/50 rounded-sm overflow-hidden relative shadow-2xl">
                      <img
                        src={miloDraft || miloPhoto || '/images/milo.jpg'}
                        alt="Milo Barbero"
                        className="w-full h-full object-cover object-top"
                      />
                      {miloDraft && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-sm uppercase tracking-wider">
                          Nueva vista previa
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions to upload & save */}
                  <div className="sm:col-span-8 space-y-4">
                    <p className="text-xs text-[#888888] leading-relaxed">
                      Sube una foto real de Milo en su estudio o cortando. Esta foto aparecerá en el encabezado, en la sección &ldquo;Sobre Milo&rdquo; y en el portafolio.
                    </p>

                    <div
                      onDrop={onDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-gold rounded-sm p-5 text-center bg-[#0D0D0D] hover:bg-[#151515] transition-all cursor-pointer group"
                    >
                      <Upload className="w-6 h-6 text-gold mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-white uppercase tracking-wider">
                        Haz clic o arrastra aquí la nueva foto de Milo
                      </p>
                      <p className="text-[11px] text-[#888888] mt-0.5">Soporta JPG, PNG y WEBP</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="O pega aquí una URL de imagen..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-sm p-2 text-xs text-white outline-none focus:border-gold"
                      />
                      <button
                        onClick={handleApplyUrl}
                        className="px-3 py-2 bg-[#222222] hover:bg-[#2c2c2c] text-gold border border-white/10 rounded-sm text-xs font-semibold cursor-pointer"
                      >
                        Cargar URL
                      </button>
                    </div>

                    {miloDraft ? (
                      <button
                        id="btn-save-milo-photo"
                        onClick={handleSaveMiloPhoto}
                        className="w-full gold-gradient text-black font-black py-3 px-4 rounded-sm text-xs uppercase tracking-widest hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <Save className="w-4 h-4" />
                        <span>💾 Guardar Foto de Milo Permanentemente</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-[#181818] border border-emerald-500/30 rounded-sm text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Foto actual guardada y activa en el sitio web.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGO PHOTO */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#141414] border border-white/10 rounded-sm space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gold" />
                    <span>Logo Oficial de Barbería Milo</span>
                  </h4>
                  <span className="text-xs text-gold font-semibold uppercase">
                    Se muestra en cabecera y pie de página
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Current / Preview Logo */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="w-40 h-40 bg-black border-2 border-gold/50 rounded-sm overflow-hidden relative shadow-2xl flex items-center justify-center p-2">
                      <img
                        src={logoDraft || logoPhoto || '/images/logo.jpg'}
                        alt="Logo Milo"
                        className="max-w-full max-h-full object-contain"
                      />
                      {logoDraft && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-black text-[9px] font-black rounded-sm uppercase tracking-wider">
                          Nueva vista previa
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-8 space-y-4">
                    <p className="text-xs text-[#888888] leading-relaxed">
                      Sube el logo oficial de Barbería Milo. Se recomienda formato PNG con fondo transparente o JPG de alta resolución.
                    </p>

                    <div
                      onDrop={onDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/20 hover:border-gold rounded-sm p-5 text-center bg-[#0D0D0D] hover:bg-[#151515] transition-all cursor-pointer group"
                    >
                      <Upload className="w-6 h-6 text-gold mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-white uppercase tracking-wider">
                        Haz clic o arrastra aquí el nuevo logo
                      </p>
                      <p className="text-[11px] text-[#888888] mt-0.5">Soporta PNG, JPG, SVG y WEBP</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="O pega aquí una URL de imagen..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-sm p-2 text-xs text-white outline-none focus:border-gold"
                      />
                      <button
                        onClick={handleApplyUrl}
                        className="px-3 py-2 bg-[#222222] hover:bg-[#2c2c2c] text-gold border border-white/10 rounded-sm text-xs font-semibold cursor-pointer"
                      >
                        Cargar URL
                      </button>
                    </div>

                    {logoDraft ? (
                      <button
                        id="btn-save-logo-photo"
                        onClick={handleSaveLogoPhoto}
                        className="w-full gold-gradient text-black font-black py-3 px-4 rounded-sm text-xs uppercase tracking-widest hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <Save className="w-4 h-4" />
                        <span>💾 Guardar Logo Permanentemente</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-[#181818] border border-emerald-500/30 rounded-sm text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Logo actual guardado y activo en la cabecera.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input for uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Footer with safety & backup actions */}
        <div className="p-3.5 bg-[#141414] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="text-[#888888] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              title="Descargar copia de seguridad con todas tus fotos"
            >
              <Download className="w-3.5 h-3.5 text-gold" />
              <span>Descargar Respaldo</span>
            </button>

            <button
              onClick={handleCopyPhotosCode}
              className="text-[#888888] hover:text-gold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              title="Copiar datos de fotos para que el asistente las guarde en los archivos del código"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gold" />}
              <span>{copiedCode ? '¡Copiado!' : 'Copiar Datos para el Asistente'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('¿Restablecer todas las fotos originales por defecto de Barbería Milo?')) {
                  resetToDefaults();
                  showToast('Fotos restablecidas a las originales por defecto.');
                }
              }}
              className="text-[#888888] hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
              title="Restablecer a las fotos originales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer originales</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="gold-gradient text-black font-bold px-5 py-2 rounded-sm text-xs uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
