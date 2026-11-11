import React, { useState, useEffect, useRef } from 'react';
import { fetchAdminRequests, fetchAllAreas, fetchActiveAds } from '../../api';
import { exportPassCardToPdf } from '../../utils/pdfExport';
import PassCard from '../../components/PassCard';
import { 
  Users, 
  Search, 
  Download, 
  RefreshCw, 
  Eye, 
  X, 
  Camera, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminMembersTab() {
  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  // Selected member for View Details Modal
  const [selectedMember, setSelectedMember] = useState(null);

  // Direct PDF generation without redirect
  const [activePassMember, setActivePassMember] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const hiddenCardRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const [reqs, areaList, adList] = await Promise.all([
        fetchAdminRequests({ status: 'paid' }),
        fetchAllAreas().catch(() => []),
        fetchActiveAds().catch(() => [])
      ]);
      setMembers(reqs || []);
      setAreas(areaList || []);
      setAds(adList || []);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError(err.message || 'Failed to load verified members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Filter members (null-safe)
  const filtered = members.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q ||
      (m.name || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q) ||
      (m.member_id || '').toLowerCase().includes(q) ||
      (m.shop || '').toLowerCase().includes(q);
    const matchesArea = !areaFilter || m.area === areaFilter;
    return matchesQ && matchesArea;
  });

  // Direct PDF Download without redirecting (as requested by user)
  const handleDirectDownloadPass = (memberToDownload) => {
    if (!memberToDownload || downloadingId) return;
    setDownloadingId(memberToDownload.member_id);
    setActivePassMember(memberToDownload);

    // Wait a tick for hidden PassCard to mount in DOM, then export after images load
    requestAnimationFrame(() => {
      setTimeout(async () => {
        try {
          await exportPassCardToPdf(hiddenCardRef.current, memberToDownload.member_id || memberToDownload.ref);
          showToast(`Pass PDF downloaded for ${memberToDownload.name}`);
        } catch (err) {
          console.error('PDF error:', err);
          showToast('Could not generate PDF. Please try again.', 'error');
        } finally {
          setDownloadingId(null);
          setActivePassMember(null);
        }
      }, 150);
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Member ID', 'Full Name', 'Mobile', 'Shop / Workplace', 'Nature of Work', 'Area', 'Pincode', 'Issue Date', 'Receipt No'];
    const rows = filtered.map(m => [
      m.member_id || '',
      m.name || '',
      m.phone || '',
      m.shop || '',
      m.work_type || '',
      m.area || '',
      m.pincode || '',
      m.paid_at ? new Date(m.paid_at).toLocaleDateString('en-IN') : '',
      m.receipt_no || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MTVS_Members_Directory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-semibold border ${
          toast.type === 'error'
            ? 'bg-rose-950 text-rose-100 border-rose-800'
            : 'bg-slate-900 text-white border-slate-700'
        }`}>
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            : <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── OFF-SCREEN PASS CARD RENDERER FOR INSTANT DIRECT PDF DOWNLOAD ── */}
      {activePassMember && (
        <div style={{ position: 'fixed', top: 0, left: '-10000px', width: '700px', zIndex: -100, pointerEvents: 'none' }} aria-hidden="true">
          <div ref={hiddenCardRef}>
            <PassCard member={activePassMember} ads={ads.slice(0, 2)} />
          </div>
        </div>
      )}

      {/* Top Header & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            Verified Union Members Directory ({filtered.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registered and fee-paid Sabhasads eligible for official union membership pass
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={loadMembers}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Member Name, Phone, Member ID, Shop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-60"
        >
          <option value="">All Areas & Wards ({areas.length})</option>
          {areas.map(a => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Member ID</th>
                <th className="py-3.5 px-4 sm:px-6">Sabhasad Name</th>
                <th className="py-3.5 px-4 sm:px-6">Shop & Nature of Work</th>
                <th className="py-3.5 px-4 sm:px-6">Area / Ward</th>
                <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Direct Pass Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400 text-sm">
                    {loading ? 'Loading members directory...' : 'No verified members found matching your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map(m => (
                  <tr key={m.member_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Member ID */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 text-xs sm:text-sm">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {m.member_id}
                      </span>
                    </td>

                    {/* Member Name */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-emerald-800 text-xs flex-shrink-0">
                          {m.photo_url ? (
                            <img src={m.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (m.name || 'MB').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{m.name}</div>
                          <div className="text-xs text-slate-400 font-mono">+91 {m.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Shop & Trade */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm">{m.shop}</div>
                      <div className="text-[11px] text-slate-400">{m.work_type}</div>
                    </td>

                    {/* Area */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">{m.area}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{m.pincode}</span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 sm:px-6 text-xs text-slate-500">
                      {m.paid_at ? new Date(m.paid_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : '—'}
                    </td>

                    {/* Direct Pass Action: View Details & Direct PDF Download (No redirect!) */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* VIEW DETAILS BUTTON */}
                        <button
                          onClick={() => setSelectedMember(m)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {/* DIRECT PDF DOWNLOAD (NO REDIRECT!) */}
                        <button
                          onClick={() => handleDirectDownloadPass(m)}
                          disabled={downloadingId === m.member_id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 disabled:opacity-50"
                          title="Directly download Member Pass PDF without redirect"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {downloadingId === m.member_id ? 'Downloading PDF...' : 'Download Pass PDF'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VIEW MEMBER DETAILS MODAL ──────────────────────────────── */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  {selectedMember.photo_url ? (
                    <img src={selectedMember.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    (selectedMember.name || 'MB').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedMember.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {selectedMember.member_id} • Ref: {selectedMember.ref}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs sm:text-sm">
              
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Mobile</span>
                  <strong className="text-slate-800 font-mono">+91 {selectedMember.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Age / Gender</span>
                  <span className="text-slate-800">{selectedMember.age} yrs • {selectedMember.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">ID Document</span>
                  <span className="text-slate-800">{selectedMember.id_type} {selectedMember.id_number ? `(${selectedMember.id_number})` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Shop / Business</span>
                  <strong className="text-slate-800">{selectedMember.shop}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Trade Type</span>
                  <span className="text-slate-800">{selectedMember.work_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Area / Ward</span>
                  <strong className="text-emerald-700">{selectedMember.area} (Pin: {selectedMember.pincode})</strong>
                </div>
              </div>

              {/* Full Address */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Workplace Address</span>
                <p className="text-slate-700 leading-relaxed">{selectedMember.address}</p>
              </div>

              {/* 3 Photos Gallery */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  Uploaded Verification Photos & Proofs
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Member Photo</span>
                    {selectedMember.photo_url ? (
                      <a href={selectedMember.photo_url} target="_blank" rel="noreferrer" className="block relative group">
                        <img src={selectedMember.photo_url} alt="Member" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                        <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold rounded-xl transition-opacity">
                          View Full
                        </span>
                      </a>
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Shop Photo</span>
                    {selectedMember.shop_photo_url ? (
                      <a href={selectedMember.shop_photo_url} target="_blank" rel="noreferrer" className="block relative group">
                        <img src={selectedMember.shop_photo_url} alt="Shop" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                        <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold rounded-xl transition-opacity">
                          View Full
                        </span>
                      </a>
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                        No Shop Photo
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">ID Proof</span>
                    {selectedMember.doc_photo_url ? (
                      <a href={selectedMember.doc_photo_url} target="_blank" rel="noreferrer" className="block relative group">
                        <img src={selectedMember.doc_photo_url} alt="Doc Proof" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                        <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold rounded-xl transition-opacity">
                          View Full
                        </span>
                      </a>
                    ) : (
                      <div className="w-full h-36 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                        No Document Photo
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Receipt & Payment Information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Receipt No</span>
                  <strong className="font-mono text-slate-800">{selectedMember.receipt_no || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Txn Reference</span>
                  <strong className="font-mono text-slate-800">{selectedMember.txn_ref || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Payment Date</span>
                  <strong className="text-slate-800">
                    {selectedMember.paid_at ? new Date(selectedMember.paid_at).toLocaleDateString('en-IN') : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Status</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Paid
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-3 border-t">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDirectDownloadPass(selectedMember);
                    setSelectedMember(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download Pass PDF</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
