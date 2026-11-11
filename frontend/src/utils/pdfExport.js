import html2pdf from 'html2pdf.js';

/**
 * Convert any <img> tags inside the root element to base64 Data URLs.
 * This completely prevents browser canvas tainting (CORS SecurityError)
 * when exporting cross-origin images (e.g. from Cloudinary) to PDF.
 */
async function inlineImages(rootEl) {
  if (!rootEl) return;
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  await Promise.all(
    imgs.map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) return;
      try {
        const res = await fetch(img.src, { mode: 'cors' });
        if (!res.ok) return;
        const blob = await res.blob();
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = resolve;
          reader.readAsDataURL(blob);
        });
      } catch {
        // Fall back gracefully if image fetch is blocked
      }
    })
  );
}

/**
 * Generates and downloads a clean A5 PDF containing ONLY the pass card.
 */
export async function exportPassCardToPdf(containerEl, memberId = 'member') {
  if (!containerEl) throw new Error('Pass element not ready');

  const element = containerEl.querySelector('.pass-card-root') || containerEl;

  // 1. Inline any cross-origin images to data URLs to avoid canvas tainting
  await inlineImages(element);

  // 2. Wait a tick for SVG/layout to settle
  await new Promise((r) => setTimeout(r, 200));

  const safeId = String(memberId || 'member').replace(/[^a-zA-Z0-9_-]/g, '_');

  const opt = {
    margin: [6, 6, 6, 6],
    filename: `MTVS_Pass_${safeId}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      windowWidth: 700,
    },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
  };

  const h2p = (typeof html2pdf === 'function' ? html2pdf : html2pdf?.default) || window.html2pdf;
  if (!h2p) throw new Error('html2pdf library could not be loaded');

  await h2p().set(opt).from(element).save();
}
