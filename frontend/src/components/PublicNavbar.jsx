import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const LANG_OPTIONS = [
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' },
];

export default function PublicNavbar() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];

  return (
    <nav className="bg-emerald-950 text-white shadow-md sticky top-0 z-40 border-b border-emerald-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* ── Brand ── */}
          <Link to="/" className="flex items-center gap-2.5 group min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              🌿
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm leading-tight tracking-tight text-white truncate max-w-[180px] sm:max-w-xs">
                मुंबई विडी तंबाखू संघ
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold hidden sm:block">
                Mumbai Vidi Tambakhu Sangh
              </div>
            </div>
          </Link>

          {/* ── Language Dropdown ── */}
          <div className="relative flex-shrink-0" ref={dropRef}>
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 border border-emerald-700/60 text-xs font-bold text-emerald-100 hover:bg-emerald-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{currentLang.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-emerald-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-emerald-950 border border-emerald-700/80 rounded-xl shadow-2xl overflow-hidden z-50">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => { setLang(opt.code); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                      lang === opt.code
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-emerald-100 hover:bg-emerald-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
