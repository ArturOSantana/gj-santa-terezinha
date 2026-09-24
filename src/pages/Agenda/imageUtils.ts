/**
 * Utilitário de compressão de imagem para artes de eventos
 * Redimensiona para máx. 900px de largura e converte para JPEG 80%
 */

export async function compressAndCropArt(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX_W = 900;
        const ratio = Math.min(1, MAX_W / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao comprimir imagem'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = ev.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}
