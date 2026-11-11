import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPassById, fetchActiveAds } from '../api';
import { exportPassCardToPdf } from '../utils/pdfExport';
import PassCard from '../components/PassCard';
import {
  Download,
  Share2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Phone,
  ExternalLink,
} from 'lucide-react';

// ── Scaled wrapper: shrinks the fixed-width PassCard to fit any screen ───────
// The card is always rendered at 700px then scaled down with CSS transform.
// This keeps the card pixel-perfect (same as PDF) but responsive on mobile.
function ScaledPassCard({ member, ads }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState('auto');

  useEffect(() => {
    const update = () => {
      if (!outerRef.current || !innerRef.current) return;
      const availW = outerRef.current.offsetWidth;
      const s = Math.min(1, availW / 700);
      const naturalH = innerRef.current.offsetHeight;
      setScale(s);
      setScaledHeight(`${naturalH * s}px`);
    };
    // Run after first paint so innerRef has height
    const id = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', update); };
  }, [member]);

  return (
    // Outer wrapper: controls the space consumed in the page flow
    <div ref={outerRef} style={{ width: '100%', maxWidth: '700px', height: scaledHeight, overflow: 'hidden' }}>
      <div
        ref={innerRef}
        style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          width: '700px',
        }}
      >
        <PassCard member={member} ads={ads} />
      </div>
    </div>
  );
}

// ── Ad Slider Component ─────────────────────────────────────────────────────
function AdSlider({ ads }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % ads.length);
    }, 3500);
  }, [ads.length]);

  useEffect(() => {
    if (ads.length < 2) return;
    reset();
    return () => clearInterval(timerRef.current);
  }, [ads.length, reset]);

  if (!ads || ads.length === 0) return null;

  const prev = () => { setCurrent(c => (c - 1 + ads.length) % ads.length); reset(); };
  const next = () => { setCurrent(c => (c + 1) % ads.length); reset(); };

  const ad = ads[current];

  const handleClick = () => {
    if (ad.redirect_url) {
      const url = ad.redirect_url.startsWith('http') ? ad.redirect_url : `https://${ad.redirect_url}`;
      window.open(url, '_blank');
    } else if (ad.phone) {
      window.location.href = `tel:+91${ad.phone.replace(/\D/g, '')}`;
    }
  };

  return (
    <div className="w-full max-w-[700px] mt-5 print:hidden">
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 cursor-pointer select-none"
        style={{ height: '140px' }}
        onClick={handleClick}
      >
        {ad.image_url ? (
          <img src={ad.image_url} alt={ad.title || 'Ad'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 font-bold text-sm">
            📢 {ad.title || 'Advertisement'}
          </div>
        )}
        {/* Overlay */}
        <div className="absolute bottom-0 left-0 right-0 py-1.5 px-3 bg-gradient-to-t from-black/55 to-transparent flex items-center gap-1.5">
          {ad.phone && <Phone className="w-3 h-3 text-white flex-shrink-0" />}
          {ad.redirect_url && <ExternalLink className="w-3 h-3 text-white flex-shrink-0" />}
          <span className="text-white text-[11px] font-semibold truncate">{ad.title || 'Click to connect'}</span>
        </div>
        {/* Nav arrows */}
        {ads.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      {/* Dots */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); reset(); }}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-emerald-600 w-5' : 'bg-slate-300 w-2 hover:bg-slate-400'}`}
            />
          ))}
        </div>
      )}
      <p className="text-center text-[10px] text-slate-400 mt-1.5">Advertisement • Click to connect</p>
    </div>
  );
}

// ── Main PassPage ───────────────────────────────────────────────────────────
export default function PassPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  // Ref for the HIDDEN PDF card (always 700px, off-screen)
  const pdfCardRef = useRef(null);

  const [member, setMember] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    Promise.all([
      fetchPassById(memberId),
      fetchActiveAds().catch(() => [])
    ])
      .then(([m, a]) => {
        setMember(m);
        setAds(a || []);
      })
      .catch(err => setError(err.message || 'Member pass could not be retrieved'))
      .finally(() => setLoading(false));
  }, [memberId]);

  // ── PDF Download — targets a *hidden* PassCard at full 700px width ────────
  const handleDownloadPDF = async () => {
    if (!pdfCardRef.current || !member) return;
    setDownloading(true);
    try {
      await exportPassCardToPdf(pdfCardRef.current, member.member_id || member.ref);
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF download failed. Try again or use browser print (Ctrl+P).');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `Mumbai Vidi Tambakhu Sangh – Verified Member Pass\nName: ${member?.name}\nID: ${member?.member_id}\nArea: ${member?.area}\nVerify: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: 'Union Pass', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Pass link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-semibold text-sm">Loading Official Union Pass...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <div className="p-8 bg-white rounded-3xl shadow-lg border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 text-xl">⚠️</div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Member Record Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'Invalid member ID or payment pending.'}</p>
          <button onClick={() => navigate('/track')} className="px-5 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl">
            ← Back to Status Tracker
          </button>
        </div>
      </div>
    );
  }

  const pdfAds = ads.slice(0, 2);

  return (
    <div className="w-full px-3 sm:px-4 py-6 flex flex-col items-center">

      {/* Top Controls */}
      <div className="w-full max-w-[700px] flex justify-between items-center mb-4 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-3 sm:px-5 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            {downloading ? 'Preparing...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── Visible Pass Card — scales to fit mobile ── */}
      <ScaledPassCard member={member} ads={[]} />

      {/* ── Ad Slider (screen only) ── */}
      <AdSlider ads={ads} />

      {/* Info Notice */}
      <div className="w-full max-w-[700px] mt-5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 text-center print:hidden">
        This verified pass is valid across all municipal wards of Greater Mumbai.
      </div>

      {/* ── OFF-SCREEN PDF Card at full 700px width (must remain visible to html2canvas) ── */}
      <div
        ref={pdfCardRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-10000px',
          width: '700px',
          pointerEvents: 'none',
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        <PassCard member={member} ads={pdfAds} />
      </div>

    </div>
  );
}
