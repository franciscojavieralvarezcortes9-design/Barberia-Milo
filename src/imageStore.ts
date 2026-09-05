import { useState, useEffect } from 'react';
import { GalleryItem } from './types';
import { DEFAULT_LOGO_PHOTO, DEFAULT_MILO_PHOTO, GALLERY_ITEMS } from './data';
import savedPhotosRaw from './savedPhotos.json';

const savedPhotos = savedPhotosRaw as {
  miloPhoto: string | null;
  logoPhoto: string | null;
  galleryItems: GalleryItem[] | null;
  lastUpdated?: string | null;
};

const STORAGE_KEY_MILO = 'milo_real_photo_v4';
const STORAGE_KEY_LOGO = 'milo_real_logo_v4';
const STORAGE_KEY_GALLERY = 'milo_real_gallery_v4';

const FALLBACK_MILO_KEYS = ['milo_real_photo_v4', 'milo_real_photo_v3', 'milo_real_photo', 'milo_real_photo_v2'];
const FALLBACK_LOGO_KEYS = ['milo_real_logo_v4', 'milo_real_logo_v3', 'milo_real_logo', 'milo_real_logo_v2'];
const FALLBACK_GALLERY_KEYS = ['milo_real_gallery_v4', 'milo_real_gallery_v3', 'milo_real_gallery', 'milo_real_gallery_v2'];

const filterUnwanted = (items: GalleryItem[]): GalleryItem[] => {
  return items.filter((item) => item.id !== 'milo-estudio' && item.id !== 'logo-oficial');
};

export interface ImageStoreState {
  miloPhoto: string | null;
  logoPhoto: string | null;
  galleryItems: GalleryItem[];
}

export function useRealImages() {
  const [miloPhoto, setMiloPhoto] = useState<string | null>(() => {
    for (const key of FALLBACK_MILO_KEYS) {
      const val = localStorage.getItem(key);
      if (val) return val;
    }
    return savedPhotos.miloPhoto || DEFAULT_MILO_PHOTO;
  });

  const [logoPhoto, setLogoPhoto] = useState<string | null>(() => {
    for (const key of FALLBACK_LOGO_KEYS) {
      const val = localStorage.getItem(key);
      if (val) return val;
    }
    return savedPhotos.logoPhoto || DEFAULT_LOGO_PHOTO;
  });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    for (const key of FALLBACK_GALLERY_KEYS) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = filterUnwanted(parsed);
            if (filtered.length > 0) return filtered;
          }
        }
      } catch {
        // continue
      }
    }
    return Array.isArray(savedPhotos.galleryItems) && savedPhotos.galleryItems.length > 0
      ? filterUnwanted(savedPhotos.galleryItems)
      : GALLERY_ITEMS;
  });

  const [lastSaved, setLastSaved] = useState<number>(Date.now());

  // Auto-sync with server so the project files on disk are kept updated
  useEffect(() => {
    const payload = {
      miloPhoto,
      logoPhoto,
      galleryItems,
      lastUpdated: new Date().toISOString(),
    };
    fetch('/api/save-uploaded-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // offline or preview fallback
    });
  }, [miloPhoto, logoPhoto, galleryItems]);

  const saveMiloPhoto = (dataUrl: string | null) => {
    if (dataUrl) {
      FALLBACK_MILO_KEYS.forEach((k) => {
        try {
          localStorage.setItem(k, dataUrl);
        } catch (e) {
          console.warn('localStorage full or restricted for Milo photo', e);
        }
      });
    } else {
      FALLBACK_MILO_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });
    }
    setMiloPhoto(dataUrl);
    setLastSaved(Date.now());
  };

  const saveLogoPhoto = (dataUrl: string | null) => {
    if (dataUrl) {
      FALLBACK_LOGO_KEYS.forEach((k) => {
        try {
          localStorage.setItem(k, dataUrl);
        } catch (e) {
          console.warn('localStorage full or restricted for logo', e);
        }
      });
    } else {
      FALLBACK_LOGO_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      });
    }
    setLogoPhoto(dataUrl);
    setLastSaved(Date.now());
  };

  const persistGallery = (items: GalleryItem[]) => {
    FALLBACK_GALLERY_KEYS.forEach((k) => {
      try {
        localStorage.setItem(k, JSON.stringify(items));
      } catch (e) {
        console.warn('localStorage error persisting gallery', e);
      }
    });
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    const updated = [newItem, ...galleryItems];
    setGalleryItems(updated);
    persistGallery(updated);
    setLastSaved(Date.now());
    return newItem;
  };

  const updateGalleryItem = (id: string, updatedFields: Partial<GalleryItem>) => {
    const updated = galleryItems.map((item) => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    setGalleryItems(updated);
    persistGallery(updated);
    setLastSaved(Date.now());
  };

  const removeGalleryItem = (id: string) => {
    const updated = galleryItems.filter((i) => i.id !== id);
    setGalleryItems(updated);
    persistGallery(updated);
    setLastSaved(Date.now());
  };

  const resetToDefaults = () => {
    FALLBACK_MILO_KEYS.forEach((k) => localStorage.removeItem(k));
    FALLBACK_LOGO_KEYS.forEach((k) => localStorage.removeItem(k));
    FALLBACK_GALLERY_KEYS.forEach((k) => localStorage.removeItem(k));
    setMiloPhoto(DEFAULT_MILO_PHOTO);
    setLogoPhoto(DEFAULT_LOGO_PHOTO);
    setGalleryItems(GALLERY_ITEMS);
    setLastSaved(Date.now());
  };

  const clearAllImages = () => {
    FALLBACK_MILO_KEYS.forEach((k) => localStorage.removeItem(k));
    FALLBACK_LOGO_KEYS.forEach((k) => localStorage.removeItem(k));
    FALLBACK_GALLERY_KEYS.forEach((k) => localStorage.removeItem(k));
    setMiloPhoto(null);
    setLogoPhoto(null);
    setGalleryItems([]);
    setLastSaved(Date.now());
  };

  const hasCustomChanges =
    miloPhoto !== DEFAULT_MILO_PHOTO ||
    logoPhoto !== DEFAULT_LOGO_PHOTO ||
    JSON.stringify(galleryItems) !== JSON.stringify(GALLERY_ITEMS);

  return {
    miloPhoto,
    logoPhoto,
    galleryItems,
    lastSaved,
    hasCustomChanges,
    saveMiloPhoto,
    saveLogoPhoto,
    addGalleryItem,
    updateGalleryItem,
    removeGalleryItem,
    resetToDefaults,
    clearAllImages,
  };
}
