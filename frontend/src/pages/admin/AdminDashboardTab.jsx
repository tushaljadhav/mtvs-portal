import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import L from 'leaflet';
import { 
  fetchAdminStats, 
  fetchAdminRequests, 
  fetchAllAreas 
} from '../../api';
import { 
  Users, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  Share2, 
  RefreshCw, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  IdCard,
  Building,
  Bell,
  Download,
  Copy,
  ExternalLink,
  X,
  Phone,
  AlertCircle
} from 'lucide-react';

// Default Mumbai Ward Coordinates
const MUMBAI_COORDS = {
  'Dharavi':      [19.0425, 72.8520],
  'Dadar':        [19.0185, 72.8428],
  'Worli':        [18.9946, 72.8232],
  'Bandra':       [19.0544, 72.8402],
  'Andheri East': [19.1136, 72.8697],
  'Andheri West': [19.1197, 72.8468],
  'Andheri':      [19.1136, 72.8697],
  'Malad':        [19.1800, 72.8488],
  'Borivali':     [19.2307, 72.8567],
  'Kurla':        [19.0718, 72.8884],
  'Chembur':      [19.0522, 72.9005],
  'Ghatkopar':    [19.0870, 72.9096],
  'Thane':        [19.2148, 72.9786],
  'Mulund':       [19.1726, 72.9565],
  'Bhandup':      [19.1458, 72.9367],
  'Byculla':      [18.9750, 72.8295],
  'Parel':        [19.0000, 72.8360],
  'Colaba':       [18.9067, 72.8147],
  'Fort':         [18.9322, 72.8354]
};

export default function AdminDashboardTab() {
  const { stats, refreshStats } = useOutletContext();
  const [allRequests, setAllRequests] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Invite & Reminder Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      refreshStats();
      const reqs = await fetchAdminRequests();
      setAllRequests(reqs || []);
      setRecentRequests((reqs || []).slice(0, 10));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoadError(err.message || 'Failed to sync dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, { 
        scrollWheelZoom: false,
        zoomControl: true 
      }).setView([19.0760, 72.8777], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Markers when allRequests changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Group paid and active members by area
    const areaMap = {};
    allRequests.forEach(r => {
      const area = r.area || 'Other';
      if (!areaMap[area]) {
        areaMap[area] = {
          area,
          total: 0,
          paid: 0,
          pending: 0,
          members: [],
          coords: r.lat && r.lng ? [r.lat, r.lng] : (MUMBAI_COORDS[area] || [19.0760, 72.8777])
        };
      }
      areaMap[area].total += 1;
      if (r.status === 'paid') {
        areaMap[area].paid += 1;
        areaMap[area].members.push(r);
      } else {
        areaMap[area].pending += 1;
      }
    });

    // Plot pins for each area
    Object.values(areaMap).forEach(group => {
      const count = group.paid || group.total;
      const isPaid = group.paid > 0;

      const pinHtml = `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <svg width="30" height="38" viewBox="0 0 28 36" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22c0-7.732-6.268-14-14-14z" fill="${isPaid ? '#FF6B35' : '#3b82f6'}"/>
            <circle cx="14" cy="14" r="7" fill="#ffffff"/>
          </svg>
          <span style="position:absolute;top:6px;font-size:10px;font-weight:900;color:${isPaid ? '#c44c1c' : '#1d4ed8'};font-family:monospace;">
            ${count}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'mumbai-map-pin',
        html: pinHtml,
        iconSize: [30, 38],
        iconAnchor: [15, 38],
        popupAnchor: [0, -38],
      });

      const popupHtml = `
        <div style="font-family:Inter,system-ui,sans-serif;width:240px;padding:0;">
          <div style="background:linear-gradient(135deg, ${isPaid ? '#FF6B35' : '#2563eb'}, ${isPaid ? '#e55a26' : '#1d4ed8'});color:#fff;padding:12px 14px;border-top-left-radius:10px;border-top-right-radius:10px;">
            <div style="font-size:15px;font-weight:800;letter-spacing:0.2px;">${group.area}</div>
            <div style="font-size:11px;opacity:0.9;margin-top:2px;">Greater Mumbai Ward Hub</div>
          </div>
          <div style="padding:12px 14px;background:#ffffff;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;">
              <span style="color:#64748b;">Active Passes:</span>
              <strong style="color:#16a34a;">${group.paid} Verified</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:12px;">
              <span style="color:#64748b;">Total Registrations:</span>
              <strong style="color:#0f172a;">${group.total}</strong>
            </div>
            ${group.members.slice(0, 3).map(m => `
              <div style="font-size:11.5px;padding:4px 0;border-top:1px dashed #f1f5f9;display:flex;justify-content:space-between;">
                <span style="font-weight:600;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">${m.name}</span>
                <span style="font-family:monospace;color:#64748b;font-size:10px;">${m.member_id || m.ref}</span>
              </div>
            `).join('')}
            ${group.members.length > 3 ? `
              <div style="font-size:10px;color:#94a3b8;margin-top:4px;text-align:center;">
                + ${group.members.length - 3} more members
              </div>
            ` : ''}
          </div>
        </div>
      `;

      const marker = L.marker(group.coords, { icon: customIcon }).addTo(markersLayerRef.current);
      marker.bindPopup(popupHtml, { maxWidth: 260, className: 'custom-mumbai-popup' });
    });
  }, [allRequests]);

  // Jump to specific region on map
  const handleMapFocus = (coords, zoom = 13) => {
    if (mapInstanceRef.current && coords) {
      mapInstanceRef.current.setView(coords, zoom, { animate: true });
    }
  };

  // Generate Invite Link Handler
  const handleGenerateInvite = () => {
    const cleanPhone = invitePhone.replace(/\D/g, '');
    if (!inviteName.trim() || cleanPhone.length !== 10) {
      showToast('Please enter Name and a valid 10-digit Phone Number');
      return;
    }
    const origin = window.location.origin;
    const url = `${origin}/register?name=${encodeURIComponent(inviteName.trim())}&phone=${encodeURIComponent(cleanPhone)}`;
    setGeneratedUrl(url);
    setCopiedLink(false);
  };

  const handleCopyInviteLink = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopiedLink(true);
      showToast('Invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    if (!generatedUrl) return;
    const cleanPhone = invitePhone.replace(/\D/g, '');
    const msg = `🌿🚬 *मुंबई विडी तंबाखू संघ (MTVS)*\n\nसस्नेह नमस्कार, ${inviteName} जी!\nमुंबई विडी तंबाखू संघामध्ये आपले अधिकृत सदस्यत्व व ओळखपत्र (Member Pass) मिळवण्यासाठी कृपया खालील लिंकवर जाऊन आपला अर्ज पूर्ण करा:\n\n👉 ${generatedUrl}\n\nआपला संघ, आपले संरक्षण!\n- मुंबई विडी तंबाखू संघ (Regd.)`;
    
    const waUrl = cleanPhone.length === 10
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Quick reminder modal
  const handleSendReminder = () => {
    setShowReminderModal(true);
  };

  const approvedUnpaidList = allRequests.filter(r => r.status === 'approved');
  const openWhatsAppPaymentReminder = (member) => {
    const cleanPhone = (member.phone || '').replace(/\D/g, '').slice(-10);
    const trackUrl = `${window.location.origin}/track/${encodeURIComponent(member.ref)}`;
    const msg = `🌿 *मुंबई विडी तंबाखू संघ (MTVS)*\n\nनमस्कार ${member.name} जी,\nआपला सदस्य अर्ज (${member.ref}) मंजूर झाला आहे!\n\nकृपया ₹१०० वार्षिक सभासद शुल्क भरून आपला अधिकृत डिजिटल सदस्य पास (Member Pass) प्राप्त करा:\n🔗 ${trackUrl}\n\n- मुंबई विडी तंबाखू संघ`;
    const waUrl = cleanPhone.length === 10
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Export members CSV directly
  const handleExportCSV = () => {
    const paidMembers = allRequests.filter(r => r.status === 'paid');
    if (paidMembers.length === 0) {
      showToast('No verified members available to export.');
      return;
    }
    const headers = ['Member ID', 'Full Name', 'Phone', 'Area', 'Shop', 'Work Type', 'Paid At', 'Receipt No'];
    const rows = paidMembers.map(m => [
      m.member_id || '',
      m.name || '',
      m.phone || '',
      m.area || '',
      m.shop || '',
      m.work_type || '',
      m.paid_at ? new Date(m.paid_at).toLocaleDateString('en-IN') : '',
      m.receipt_no || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MTVS_Members_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Members directory CSV downloaded!');
  };

  // Stats calculation
  const totalMembers = stats?.paid || 0;
  const pendingCount = stats?.pending || 0;
  const approvedCount = stats?.approved || 0;
  const todayCount = stats?.paid_today || 0;
  const thisMonthCount = stats?.paid_this_month || 0;
  const totalRevenue = stats?.totalRevenue || totalMembers * 100;
  const areaDistribution = stats?.byArea || [];
  const workTypeBreakdown = stats?.byWorkType || [];
  const monthlyTrends = stats?.monthly || [];

  const maxMonthly = Math.max(...monthlyTrends.map(m => m.total || 0), 5);
  const maxAreaCount = Math.max(...areaDistribution.map(a => a.count || 0), 5);

  const todayMr = new Date().toLocaleDateString('mr-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayEn = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {loadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* ── 1. TOP EXECUTIVE HEADER BANNER ───────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                MTVS Executive Union Dashboard
              </h1>
              <div className="text-xs sm:text-sm text-emerald-400 font-semibold mt-0.5">
                मुंबई विडी तंबाखू संघ — केंद्रीय प्रशासकीय नियंत्रण कक्ष
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{todayMr} &nbsp;·&nbsp; {todayEn}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Generate WhatsApp Invite</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* ── 2. QUICK ACTIONS BAR (Identical to index.html & expanded) ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Quick Actions:
        </span>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Generate Invite Link / आमंत्रण</span>
        </button>

        <button
          onClick={handleSendReminder}
          className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
        >
          <Bell className="w-3.5 h-3.5 text-amber-600" />
          <span>Send Renewal Reminder / स्मरणपत्र</span>
        </button>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-200"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export CSV / निर्यात</span>
        </button>

        {pendingCount > 0 && (
          <Link
            to="/admin/requests"
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 border border-amber-200 ml-auto animate-pulse"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Requests Waiting / प्रलंबित विनंत्या ({pendingCount})</span>
            <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Link>
        )}

        <Link
          to="/admin/members"
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>View All Members / सर्व सदस्य</span>
        </Link>
      </div>

      {/* ── 3. 6 KPI STAT CARDS (Full Suite from index.html) ─────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Stat 1: Total Registered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">
            {allRequests.length || (stats?.total || 0)}
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            एकूण नोंदणीकृत
          </div>
        </div>

        {/* Stat 2: Active Verified Pass Holders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Members</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mb-0.5">
            {totalMembers}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600">
            सक्रिय सदस्य (Pass Issued)
          </div>
        </div>

        {/* Stat 3: Total Payments Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-semibold text-teal-700">
            जमा वर्गणी (₹100/सभासद)
          </div>
        </div>

        {/* Stat 4: Pending Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mb-0.5">
            {pendingCount}
          </div>
          <div className="text-[11px] font-semibold text-amber-700">
            प्रलंबित अर्ज (Awaiting)
          </div>
        </div>

        {/* Stat 5: Approved / Awaiting Fee */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mb-0.5">
            {approvedCount}
          </div>
          <div className="text-[11px] font-semibold text-blue-700">
            मंजूर (Unpaid)
          </div>
        </div>

        {/* Stat 6: New This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">This Month</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 mb-0.5">
            {thisMonthCount ?? 0}
          </div>
          <div className="text-[11px] font-semibold text-purple-700">
            या महिन्यातील नवीन
          </div>
        </div>

      </div>

      {/* ── 4. TWO-COLUMN: LEAFLET MAP + REGIONAL WARD BREAKDOWN ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Interactive Leaflet Map of Mumbai */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Mumbai Member Geographic Distribution
                  <span className="text-xs font-normal text-slate-400">/ मुंबई सदस्य स्थान</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive ward map showing live verified pass holders across Greater Mumbai
                </p>
              </div>

              {/* Quick Area Jump Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Focus Hub:</span>
                <button
                  onClick={() => handleMapFocus([19.0425, 72.8520], 13)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Dharavi
                </button>
                <button
                  onClick={() => handleMapFocus([19.0185, 72.8428], 13)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Dadar
                </button>
                <button
                  onClick={() => handleMapFocus([19.0718, 72.8884], 13)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Kurla
                </button>
                <button
                  onClick={() => handleMapFocus([19.1136, 72.8697], 13)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Andheri
                </button>
                <button
                  onClick={() => handleMapFocus([19.0760, 72.8777], 11)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Map Container with Floating Pill */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner" style={{ isolation: 'isolate' }}>
              <div ref={mapContainerRef} style={{ height: '420px', width: '100%' }} />

              {/* Floating Map Legend Badge */}
              <div className="absolute top-3 right-3 z-[800] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200/80 pointer-events-none text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-3 h-3 rounded-full bg-[#FF6B35] inline-block shadow-xs"></span>
                  <span>Verified Pass Holders ({totalMembers})</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-slate-500">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs"></span>
                  <span>Pending Registrations</span>
                </div>
                <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1 mt-0.5">
                  © OpenStreetMap • MTVS Network
                </div>
              </div>
            </div>
          </div>

          {/* Map Footer Info */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Pins represent ward member clusters
              </span>
              <span>Click any pin to inspect active members</span>
            </div>
            <Link
              to="/admin/areas"
              className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Manage Area Masters <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column (4 cols): Area Distribution & Trade Breakdown */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Top: Ward & Area Distribution */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  Top Mumbai Wards
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                  {areaDistribution.length} Wards
                </span>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {areaDistribution.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No area statistics recorded.
                  </div>
                ) : (
                  areaDistribution.slice(0, 6).map((item, idx) => {
                    const pct = Math.round((item.count / maxAreaCount) * 100);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleMapFocus(MUMBAI_COORDS[item.area] || [19.0760, 72.8777], 13)}
                        className="space-y-1 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                            📍 {item.area}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            <strong className="text-slate-900">{item.count}</strong> total ({item.paid_count} paid)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-2 text-center">
              <Link to="/admin/members" className="text-xs font-bold text-orange-600 hover:underline">
                Filter Members by Ward →
              </Link>
            </div>
          </div>

          {/* Bottom: Trade / Business Classification */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-700" />
              Member Trade Classification
            </h3>
            <p className="text-[11px] text-slate-400 mb-3.5">
              Breakdown by business nature & trade type
            </p>

            <div className="space-y-2.5">
              {workTypeBreakdown.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No trade data recorded.
                </div>
              ) : (
                workTypeBreakdown.slice(0, 4).map((wt, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 text-xs">
                    <span className="font-semibold text-slate-800 truncate mr-2">
                      🏷️ {wt.work_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px]">
                      {wt.count} members
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. GROWTH VELOCITY & FINANCIAL SUMMARY ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Signups Trend */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Membership Growth Velocity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly registration and verification volume
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
              Last 6 Months
            </span>
          </div>

          {monthlyTrends.length === 0 ? (
            <div className="py-14 text-center text-xs text-slate-400">
              No enrollment trends recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2">
                {monthlyTrends.map((m, idx) => {
                  const pct = Math.max(18, Math.round((m.total / maxMonthly) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.total}
                      </span>
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full max-w-[44px] bg-gradient-to-t from-emerald-700 to-teal-500 rounded-xl group-hover:brightness-110 transition-all relative"
                      >
                        <div
                          style={{ height: `${Math.round(((m.paid || 0) / Math.max(m.total, 1)) * 100)}%` }}
                          className="w-full bg-emerald-950 rounded-b-xl absolute bottom-0 opacity-50"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 truncate w-full text-center">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-teal-500 inline-block" />
                  <span>Total Signups</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-950 inline-block" />
                  <span>Paid Pass Holders</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Payment Summary (Line / Bar Financial Indicator) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Monthly Payment Summary
                  <span className="text-xs font-normal text-slate-400">/ मासिक देयक सारांश</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ₹100 annual subscription revenue collected
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-800 rounded-lg border border-orange-200">
                Revenue View
              </span>
            </div>

            <div className="space-y-3">
              {monthlyTrends.map((m, idx) => {
                const revenue = (m.paid || 0) * 100;
                const pct = Math.max(12, Math.round(((m.paid || 0) / Math.max(totalMembers, 1)) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{m.month}</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        ₹{revenue.toLocaleString('en-IN')} <span className="text-slate-400 font-normal">({m.paid || 0} members)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 flex justify-between items-center text-xs">
            <span className="text-slate-500">Cumulative Recorded Revenue:</span>
            <strong className="text-base text-emerald-800 font-black">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

      </div>

      {/* ── 6. REAL-TIME ACTIVITY STREAM ──────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Live Union Activity Stream
              <span className="text-xs font-normal text-slate-400">/ अलीकडील क्रियाकलाप</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest registrations, verification decisions, and pass issuances
            </p>
          </div>
          <Link
            to="/admin/members"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Open Members Directory →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {recentRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No recent activity recorded.
            </div>
          ) : (
            recentRequests.map(r => (
              <div key={r.ref} className="py-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black border border-orange-200 flex-shrink-0 text-sm">
                    {(r.name || 'MB').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{r.name}</div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>{r.shop || 'दुकान'}</span>
                      <span>•</span>
                      <strong className="text-slate-700">📍 {r.area}</strong>
                      <span>•</span>
                      <span className="font-mono text-slate-400">{r.ref}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {r.status === 'paid' && (
                    <span className="px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified Member
                    </span>
                  )}
                  {r.status === 'approved' && (
                    <span className="px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-800 text-[11px]">
                      Approved (Fee Pending)
                    </span>
                  )}
                  {r.status === 'pending' && (
                    <span className="px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800 text-[11px]">
                      Pending Review
                    </span>
                  )}

                  {r.member_id && (
                    <Link
                      to={`/pass/${encodeURIComponent(r.member_id)}`}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg text-white font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <IdCard className="w-3.5 h-3.5 text-orange-400" />
                      View Pass
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── 7. QUICK GENERATE INVITE LINK MODAL ───────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-scaleUp my-8">
            <button
              onClick={() => {
                setShowInviteModal(false);
                setGeneratedUrl('');
                setInviteName('');
                setInvitePhone('');
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Generate Member Invite Link
                </h3>
                <p className="text-xs text-slate-500">
                  सदस्य आमंत्रण लिंक — Send directly to WhatsApp
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 my-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Enter the merchant's Name and 10-digit WhatsApp number. This will pre-fill their registration form and draft a WhatsApp invite.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Member Full Name / पूर्ण नाव
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Number / फोन नंबर
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateInvite}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Generate Link / लिंक तयार करा</span>
              </button>

              {/* Generated Result Box */}
              {generatedUrl && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Link Ready! Share directly or copy:</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={generatedUrl}
                      className="bg-transparent text-xs font-mono text-slate-700 flex-1 outline-none px-2 select-all"
                    />
                    <button
                      onClick={handleCopyInviteLink}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={handleShareWhatsApp}
                      className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Send on WhatsApp</span>
                    </button>

                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Form</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── 8. FEE & RENEWAL WHATSAPP REMINDERS MODAL ───────────────── */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative my-8">
              <button
                onClick={() => setShowReminderModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Fee Payment Reminders</h3>
                  <p className="text-xs text-slate-500">
                    Approved applicants awaiting ₹100 membership fee ({approvedUnpaidList.length})
                  </p>
                </div>
              </div>

              {approvedUnpaidList.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                  All approved applicants have completed their fee payment.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {approvedUnpaidList.map(m => (
                    <div key={m.ref} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{m.name}</div>
                        <div className="text-slate-500 font-mono">+91 {m.phone} • {m.area}</div>
                      </div>
                      <button
                        onClick={() => openWhatsAppPaymentReminder(m)}
                        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs flex-shrink-0"
                      >
                        WhatsApp →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}