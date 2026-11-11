import html2pdf from 'html2pdf.js';

/**
 * Wait for all <img> elements inside a DOM node to finish loading (or error/timeout).
 */
function waitForImages(rootEl, timeoutMs = 4000) {
  if (!rootEl) return Promise.resolve();
  const imgs = Array.from(rootEl.querySelectorAll('img'));
  if (imgs.length === 0) return Promise.resolve();

  const promises = imgs.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  });

  const timer = new Promise((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([Promise.all(promises), timer]);
}

/**
 * Generates and downloads a clean A5 PDF containing ONLY the pass card.
 * Note: container element must NOT have CSS `visibility: hidden` or `display: none`,
 * otherwise html2canvas renders a blank page. Use off-screen `left: -10000px`.
 */
export async function exportPassCardToPdf(containerEl, memberId = 'member') {
  if (!containerEl) throw new Error('Pass element not ready');

  const element = containerEl.querySelector('.pass-card-root') || containerEl;
  await new Promise((r) => setTimeout(r, 150));
  await waitForImages(element, 4000);

  const safeId = String(memberId || 'member').replace(/[^a-zA-Z0-9_-]/g, '_');

  const opt = {
    margin: [6, 6, 6, 6],
    filename: `MTVS_Pass_${safeId}.pdf`,
    image: { type: 'jpeg', quality: 0.97 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
    },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
  };

  await html2pdf().set(opt).from(element).save();
}
