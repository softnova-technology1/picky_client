/**
 * Lightweight client-side image compression utility
 * Converts large user-uploaded photos (often 5-15MB) into compact, crisp JPEG data URLs (typically 40-90KB)
 * Prevents browser LocalStorage / SessionStorage quota exhaustion (5MB limit) and accelerates checkout.
 */
export async function compressImageFile(file, { maxWidth = 900, maxHeight = 900, quality = 0.75 } = {}) {
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    // Only process raster images
    if (!file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Scale down proportionally if larger than maximum constraints
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
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');

      // Preserve clean rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to high-efficiency JPEG (or WebP where supported)
      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (_) {
        resolve(canvas.toDataURL());
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to standard dataURL if image load fails
      const fallbackReader = new FileReader();
      fallbackReader.onload = () => resolve(fallbackReader.result);
      fallbackReader.onerror = () => resolve(null);
      fallbackReader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
