import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { fetchRequestByRef, fetchRegionsWithAreas } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  IdCard, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function StatusTrackerPage() {
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { query: urlParam } = useParams();

  const initialInput = searchParams.get('ref') || searchParams.get('phone') || urlParam || '';

  const [inputVal, setInputVal] = useState(initialInput);
  const [request, setRequest] = useState(null);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRegionsWithAreas().then(setRegions).catch(() => {});
  }, []);

  const loadStatus = async (identifier) => {
    if (!identifier || !identifier.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchRequestByRef(identifier.trim());
      setRequest(data);
    } catch (err) {
      setError(err.message || 'Application not found with this Reference or Mobile number');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialInput) {
      loadStatus(initialInput);
    }
  }, [initialInput]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStatus(inputVal);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText('mtvs.union@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find representative only for paid members
  const assignedRegion = request?.status === 'paid' && regions.find(r =>
    (r.areas || []).some(a => a.name === request.area)
  );

  const upiUri = request
    ? `upi://pay?pa=mtvs.union@okaxis&pn=Mumbai%20Vidi%20Tambakhu%20Sangh&am=100.00&cu=INR&tn=${encodeURIComponent(request.ref)}`
    : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Search Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <Search className="w-6 h-6 text-emerald-600" />
          {t('trackTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          {t('trackSubtitle')}
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="REQ-2026-XXXXX or 9876543210"
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? t('searching') : t('searchBtn')}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {request && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
          {/* Header Bar with Badge */}
          <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/70">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('appRef')}
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-slate-800">
                {request.ref}
              </div>
            </div>

            <div>
              {request.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5" /> {t('underVerification')}
                </span>
              )}
              {request.status === 'approved' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  <CreditCard className="w-3.5 h-3.5" /> {t('approvedWaitingPay')}
                </span>
              )}
              {request.status === 'paid' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('verifiedActiveMember')}
                </span>
              )}
              {request.status === 'rejected' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" /> {t('appRejected')}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Visual Progress Bar */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border-b-2 border-emerald-600 pb-2">
                <div className="text-[10px] text-emerald-700 font-extrabold uppercase">{t('step1')}</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">{t('stepSubmitted')}</div>
              </div>
              <div
                className={`border-b-2 pb-2 transition-colors ${
                  request.status === 'approved' || request.status === 'paid'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">{t('step2')}</div>
                <div className="text-xs sm:text-sm font-semibold">{t('stepApproved')}</div>
              </div>
              <div
                className={`border-b-2 pb-2 transition-colors ${
                  request.status === 'paid'
                    ? 'border-emerald-600 text-emerald-800 font-bold'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">{t('step3')}</div>
                <div className="text-xs sm:text-sm font-semibold">{t('stepPassed')}</div>
              </div>
            </div>

            {/* Applicant Details Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block text-xs">{t('fullName')}</span>
                <strong className="text-slate-800 text-sm sm:text-base">{request.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">{t('area')}</span>
                <span className="text-slate-700 font-semibold">{request.area}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">{t('shopName')}</span>
                <span className="text-slate-700">{request.shop} ({request.work_type})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">{t('mobile')}</span>
                <span className="text-slate-700 font-mono">+91 {request.phone}</span>
              </div>
            </div>

            {/* STATE 1: PENDING */}
            {request.status === 'pending' && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-sm sm:text-base font-bold text-amber-900">
                  {t('pendingHeading')}
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 max-w-md mx-auto leading-relaxed">
                  {t('pendingDesc')}
                </p>
              </div>
            )}

            {/* STATE 2: APPROVED - PAYMENT QR CODE */}
            {request.status === 'approved' && (
              <div className="p-6 bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-200 rounded-3xl text-center space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                    {t('approvedHeading')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {t('approvedDesc')}
                  </p>
                </div>

                <div className="inline-block p-4 bg-white rounded-3xl shadow-md border border-slate-200">
                  <QRCodeSVG value={upiUri} size={180} />
                  <div className="mt-3 text-lg font-black text-emerald-700">₹100.00</div>
                  <div className="text-[11px] text-slate-400 font-mono">MTVS Annual Membership</div>
                </div>

                <div className="max-w-sm mx-auto p-3 bg-white rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">UPI ID</span>
                    <strong className="font-mono text-slate-700 text-xs sm:text-sm">mtvs.union@okaxis</strong>
                  </div>
                  <button
                    onClick={copyUpi}
                    className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-medium flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: PAID */}
            {request.status === 'paid' && (
              <div className="p-6 bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl text-center space-y-5">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <h3 className="text-xl font-black text-emerald-950">
                    {t('paidHeading')}
                  </h3>
                  <div className="text-sm text-emerald-800 mt-1">
                    Member ID: <strong className="font-mono text-base">{request.member_id}</strong>
                  </div>
                </div>

                {/* REVIEWING REPRESENTATIVE (SHOWN AFTER PAYMENT ONLY) */}
                {assignedRegion && (
                  <div className="p-3.5 bg-white/80 rounded-2xl border border-emerald-200 text-left text-xs sm:text-sm flex items-start gap-3 max-w-md mx-auto">
                    <UserCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-500 text-[11px] uppercase font-bold">
                        Reviewing Union Representative
                      </div>
                      <div className="font-bold text-slate-900">
                        {assignedRegion.approver} ({assignedRegion.name})
                      </div>
                      <div className="text-slate-600 font-mono mt-0.5">
                        Contact: +91 {assignedRegion.phone}
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  to={`/pass/${encodeURIComponent(request.member_id)}`}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base shadow-lg transition-transform hover:scale-105"
                >
                  <IdCard className="w-5 h-5 text-amber-300" />
                  {t('viewPassBtn')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* STATE 4: REJECTED */}
            {request.status === 'rejected' && (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-3">
                <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h3 className="text-base font-bold text-rose-900">
                  Application Could Not Be Approved
                </h3>
                <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">
                  Reason: {request.reason_key || 'Uploaded documentation was incomplete or unclear'}.
                </p>
                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-block px-5 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl"
                  >
                    Submit New Application
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
