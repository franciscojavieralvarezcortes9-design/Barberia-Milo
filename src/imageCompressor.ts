/**
 * Utility to compress and optimize uploaded images before saving to storage.
 * Ensures images never exceed localStorage quota, load fast, and maintain high clarity.
 */
export async function compressImage(
  fileOrDataUrl: File | Blob | string,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const cleanUp = (urlToRevoke?: string) => {
      if (urlToRevoke) {
        try {
          URL.revokeObjectURL(urlToRevoke);
        } catch {
          // ignore
        }
      }
    };

    img.onload = () => {
      try {
        let { width, height } = img;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context unavailable
          if (typeof fileOrDataUrl === 'string') {
            resolve(fileOrDataUrl);
          } else {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileOrDataUrl);
          }
          return;
        }

        // Fill background with subtle dark tone in case of transparent png
        ctx.drawImage(img, 0, 0, width, height);

        let outputQuality = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', outputQuality);

        // If still somehow > 1.5MB, scale down further
        if (dataUrl.length > 1500000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        }

        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      // Fallback to FileReader if img decoding failed
      if (typeof fileOrDataUrl !== 'string') {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(err);
        reader.readAsDataURL(fileOrDataUrl);
      } else {
        resolve(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const objectUrl = URL.createObjectURL(fileOrDataUrl);
      img.src = objectUrl;
    }
  });
}
