import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Preload and inline any <img> tags inside the root element to base64 Data URLs.
 * This completely prevents browser canvas tainting (CORS SecurityError)
 * when exporting cross-origin images (e.g. from Cloudinary) to PDF.
 */
async function inlineImages(rootEl) {
  if (!rootEl) return;
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:')) return;
      try {
        const res = await fetch(src, { mode: 'cors' });
        if (!res.ok) return;
        const blob = await res.blob();
        if (!blob.type || !blob.type.startsWith('image/')) return;
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = resolve;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        // Fall back gracefully if image fetch is blocked by CORS
      }
    })
  );
}

/**
 * Generates and downloads a clean A5 PDF containing ONLY the pass card.
 * Uses html2canvas + jsPDF directly for maximum speed and rock-solid reliability.
 */
export async function exportPassCardToPdf(containerEl, memberId = 'member') {
  if (!containerEl) throw new Error('Pass element not ready');

  const element = containerEl.querySelector('.pass-card-root') || containerEl;

  // 1. Convert cross-origin images to base64 data URLs to prevent canvas tainting
  try {
    await inlineImages(element);
  } catch (e) {
    console.warn('Image inlining skipped:', e);
  }

  // 2. Allow layout and fonts to settle
  await new Promise((r) => setTimeout(r, 150));

  // 3. Render DOM element directly to HTML5 canvas at high resolution (scale 2)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 10000,
  });

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas render produced empty dimensions');
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // 4. Generate A5 PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 6; // 6mm margin
  const printWidth = pageWidth - (margin * 2);
  const printHeight = (canvas.height * printWidth) / canvas.width;

  // Center vertically if it fits nicely on a single A5 sheet
  const yPos = printHeight < (pageHeight - margin * 2)
    ? margin + ((pageHeight - margin * 2 - printHeight) / 4)
    : margin;

  pdf.addImage(imgData, 'JPEG', margin, yPos, printWidth, Math.min(printHeight, pageHeight - margin));

  const safeId = String(memberId || 'member').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`MTVS_Pass_${safeId}.pdf`);
  return true;
}
