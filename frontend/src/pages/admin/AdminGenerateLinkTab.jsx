import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Send, 
  Phone, 
  User, 
  MapPin, 
  ExternalLink,
  MessageCircle,
  Sparkles
} from 'lucide-react';

export default function AdminGenerateLinkTab() {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentInvites, setRecentInvites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mtvs_recent_invites') || '[]');
    } catch {
      return [];
    }
  });

  const cleanPhone = mobile.replace(/\D/g, '').slice(-10);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  
  // Generated Registration URL
  const inviteUrl = cleanPhone.length === 10
    ? `${origin}/register?mobile=${cleanPhone}${name ? `&name=${encodeURIComponent(name.trim())}` : ''}`
    : `${origin}/register`;

  // Pre-drafted WhatsApp invitation message in Marathi & English
  const whatsappMessage = `नमस्कार${name ? ` ${name.trim()}` : ''}!

मुंबई विडी तंबाखू संघ (MTVS) अधिकृत सभासद नोंदणीसाठी खालील लिंकवर क्लिक करून आपला अर्ज त्वरित पूर्ण करा:

🔗 ${inviteUrl}

📌 वार्षिक सभासद शुल्क: ₹१०० (अर्जाची पडताळणी झाल्यानंतरच देय आहे).
अर्ज भरल्यानंतर आपल्याला डिजिटल सभासद पास (Union Pass) जारी केला जाईल.

- मुंबई विडी तंबाखू संघ (प्रशासन कक्ष)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppRedirect = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (cleanPhone.length !== 10) {
      setErrorMsg('कृपया वैध १० अंकी मोबाईल नंबर टाका (Please enter valid 10-digit mobile number)');
      return;
    }

    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Save to recent invites
    const updated = [
      { phone: cleanPhone, name: name.trim() || 'Sabhasad', time: new Date().toISOString() },
      ...recentInvites.filter(i => i.phone !== cleanPhone)
    ].slice(0, 10);
    setRecentInvites(updated);
    try {
      localStorage.setItem('mtvs_recent_invites', JSON.stringify(updated));
    } catch {}

    // Open WhatsApp Web or mobile app
    window.open(waUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
            📲
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Generate & Send WhatsApp Registration Link
            </h1>
            <p className="text-emerald-200 text-xs sm:text-sm mt-0.5 font-devanagari">
              नवीन सभासदांसाठी व्हॉट्सॲप नोंदणी लिंक पाठवा
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100/90 mt-3 max-w-2xl leading-relaxed">
          Enter applicant mobile number. The system will craft a personalized registration link with a pre-filled draft message and redirect directly to WhatsApp.
        </p>
      </div>

      {/* Main Generator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Form Input (3 cols) */}
        <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            Applicant Information
          </h2>

          <form onSubmit={handleWhatsAppRedirect} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Applicant Mobile Number / मोबाईल नंबर <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">+91</span>
                <input
                  type="tel"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setErrorMsg(''); }}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              {errorMsg && <p className="text-xs text-rose-600 font-semibold mt-1">{errorMsg}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Applicant Name / नाव (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. Suresh Patil"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Live Generated URL */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Generated Joining URL
              </span>
              <div className="font-mono text-xs text-emerald-800 truncate select-all">
                {inviteUrl}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={cleanPhone.length !== 10}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Redirect & Send on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* WhatsApp Draft Preview (2 cols) */}
        <div className="lg:col-span-2 bg-[#EFEAE2] p-5 sm:p-6 rounded-3xl border border-slate-300 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-3 pb-2 border-b border-emerald-900/10">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              WhatsApp Message Preview
            </div>

            {/* WhatsApp Chat Bubble */}
            <div className="bg-white p-4 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
              {whatsappMessage}
              <div className="text-[9px] text-slate-400 text-right mt-2 font-mono">
                Just now • Delivered
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-4 text-center">
            Clicking "Send on WhatsApp" will automatically launch WhatsApp Web or App with this text ready.
          </div>
        </div>

      </div>

      {/* Recent Sent Invites */}
      {recentInvites.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Recently Sent Invites</h3>
          <div className="divide-y divide-slate-100">
            {recentInvites.map((inv, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-800">{inv.name}</strong>
                  <span className="font-mono text-slate-500 ml-2">+91 {inv.phone}</span>
                </div>
                <button
                  onClick={() => {
                    setMobile(inv.phone);
                    setName(inv.name);
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Re-send →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
