import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchAdminRequests, decideRequest } from '../../api';
import { 
  FileText, 
  Clock, 
  CreditCard, 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function AdminRequestsTab() {
  const { refreshStats } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved' | 'paid' | 'rejected' | 'all'
  const [search, setSearch] = useState('');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectingRef, setRejectingRef] = useState(null);
  const [rejectReason, setRejectReason] = useState('ID Document Unclear');
  const [payingRef, setPayingRef] = useState(null);
  const [txnRefInput, setTxnRefInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminRequests();
      setRequests(data || []);
      refreshStats();
    } catch (err) {
      console.error('Failed to load requests:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (ref, action, reason = null, txnRef = null) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await decideRequest(ref, action, reason, txnRef);
      await loadRequests();
      setSelectedRequest(null);
      setRejectingRef(null);
      setPayingRef(null);
      setTxnRefInput('');
      if (action === 'approve') showToast('Application approved! Ready for ₹100 fee payment.');
      else if (action === 'reject') showToast('Application rejected.', 'info');
      else if (action === 'pay') showToast('Payment recorded & Member Pass issued!');
    } catch (err) {
      showToast('Action failed: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Null-safe filter
  const filtered = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    
    if (search.trim()) {
      const s = search.toLowerCase().trim();
      return (r.name || '').toLowerCase().includes(s) ||
             (r.phone || '').includes(s) ||
             (r.ref || '').toLowerCase().includes(s) ||
             (r.shop || '').toLowerCase().includes(s) ||
             (r.area || '').toLowerCase().includes(s);
    }
    return true;
  });

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-700" />
            Joining Requests Verification &amp; Approval
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review applicant identity documents, approve membership, or record ₹100 fee collections
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={loading}
          className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'pending',  label: 'Pending Review',      count: requests.filter(r => r.status === 'pending').length },
            { id: 'approved', label: 'Waiting for Payment', count: requests.filter(r => r.status === 'approved').length },
            { id: 'paid',     label: 'Verified Paid',       count: requests.filter(r => r.status === 'paid').length },
            { id: 'rejected', label: 'Rejected',            count: requests.filter(r => r.status === 'rejected').length },
            { id: 'all',      label: 'All Requests',        count: requests.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${
                statusFilter === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search applicant, phone, or ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Applicant</th>
                <th className="py-3.5 px-4 sm:px-6">Shop &amp; Nature of Work</th>
                <th className="py-3.5 px-4 sm:px-6">Area / Ward</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-slate-400 text-sm">
                    {loading ? 'Loading requests...' : 'No applications found in this view.'}
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.ref} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-emerald-800 text-xs flex-shrink-0">
                          {r.photo_url ? (
                            <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (r.name || 'MB').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{r.name}</div>
                          <div className="text-xs text-slate-400 font-mono">+91 {r.phone} • {r.ref}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm">{r.shop}</div>
                      <div className="text-[11px] text-slate-400">{r.work_type}</div>
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">{r.area}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{r.pincode}</span>
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      {r.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {r.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <CreditCard className="w-3 h-3" /> Waiting for Payment
                        </span>
                      )}
                      {r.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active Member
                        </span>
                      )}
                      {r.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>

                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(r.ref, 'approve')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingRef(r.ref)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        {r.status === 'approved' && (
                          <button
                            onClick={() => { setPayingRef(r.ref); setTxnRefInput(''); }}
                            disabled={actionLoading}
                            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs disabled:opacity-50"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Mark Paid (₹100)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: APPLICATION DETAILS */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Application Documents</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {selectedRequest.photo_url ? (
                    <img src={selectedRequest.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (selectedRequest.name || 'MB').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{selectedRequest.name}</h4>
                  <div className="text-slate-500">{selectedRequest.ref} • {selectedRequest.gender}, {selectedRequest.age} yrs</div>
                  <div className="text-slate-700 font-mono mt-0.5">+91 {selectedRequest.phone}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200">
                <div><strong>Shop / Workplace:</strong> {selectedRequest.shop}</div>
                <div><strong>Nature of Work:</strong> {selectedRequest.work_type}</div>
                <div><strong>Area:</strong> {selectedRequest.area} (Pincode: {selectedRequest.pincode})</div>
                <div><strong>Address:</strong> {selectedRequest.address}</div>
                <div><strong>ID Proof:</strong> {selectedRequest.id_type} {selectedRequest.id_number ? `(${selectedRequest.id_number})` : ''}</div>
                {selectedRequest.email && <div><strong>Email:</strong> {selectedRequest.email}</div>}
                {selectedRequest.status === 'rejected' && selectedRequest.reason_key && (
                  <div className="text-rose-700"><strong>Rejection Reason:</strong> {selectedRequest.reason_key}</div>
                )}
                {selectedRequest.status === 'paid' && (
                  <div className="text-emerald-700 pt-1 border-t border-slate-200 mt-1">
                    <strong>Member ID:</strong> <span className="font-mono">{selectedRequest.member_id}</span> • <strong>Receipt:</strong> <span className="font-mono">{selectedRequest.receipt_no}</span>
                  </div>
                )}
              </div>

              {/* Uploaded Verification Photos (Member, Shop, Document) */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                  Uploaded Photos &amp; Verification Proofs
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-50 border rounded-xl text-center">
                    <span className="text-[9px] font-bold block mb-1 text-slate-500">Member</span>
                    {selectedRequest.photo_url ? (
                      <a href={selectedRequest.photo_url} target="_blank" rel="noreferrer">
                        <img src={selectedRequest.photo_url} alt="" className="w-full h-20 object-cover rounded-lg border" />
                      </a>
                    ) : <span className="text-[10px] text-slate-400">None</span>}
                  </div>

                  <div className="p-2 bg-slate-50 border rounded-xl text-center">
                    <span className="text-[9px] font-bold block mb-1 text-slate-500">Shop</span>
                    {selectedRequest.shop_photo_url ? (
                      <a href={selectedRequest.shop_photo_url} target="_blank" rel="noreferrer">
                        <img src={selectedRequest.shop_photo_url} alt="" className="w-full h-20 object-cover rounded-lg border" />
                      </a>
                    ) : <span className="text-[10px] text-slate-400">None</span>}
                  </div>

                  <div className="p-2 bg-slate-50 border rounded-xl text-center">
                    <span className="text-[9px] font-bold block mb-1 text-slate-500">Document</span>
                    {selectedRequest.doc_photo_url ? (
                      <a href={selectedRequest.doc_photo_url} target="_blank" rel="noreferrer">
                        <img src={selectedRequest.doc_photo_url} alt="" className="w-full h-20 object-cover rounded-lg border" />
                      </a>
                    ) : <span className="text-[10px] text-slate-400">None</span>}
                  </div>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleAction(selectedRequest.ref, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Approve Application'}
                  </button>
                  <button
                    onClick={() => {
                      setRejectingRef(selectedRequest.ref);
                      setSelectedRequest(null);
                    }}
                    disabled={actionLoading}
                    className="py-2.5 px-4 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs sm:text-sm hover:bg-rose-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}

              {selectedRequest.status === 'approved' && (
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => {
                      setPayingRef(selectedRequest.ref);
                      setTxnRefInput('');
                      setSelectedRequest(null);
                    }}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    Record ₹100 Fee &amp; Issue Pass
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {payingRef && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Confirm ₹100 Subscription Fee</h3>
            <p className="text-xs text-slate-500 mb-4">
              Marking <strong className="font-mono">{payingRef}</strong> as Paid will immediately issue an official MTVS Member ID and Pass.
            </p>

            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              UPI / Cash Transaction Ref (Optional)
            </label>
            <input
              type="text"
              value={txnRefInput}
              onChange={(e) => setTxnRefInput(e.target.value)}
              placeholder="Auto-generated if left blank"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono mb-5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setPayingRef(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(payingRef, 'pay', null, txnRefInput || null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {actionLoading ? 'Issuing Pass...' : 'Confirm & Issue Pass'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT REASON */}
      {rejectingRef && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Select Rejection Reason</h3>
            <p className="text-xs text-slate-500 mb-4">The applicant will see this reason on their status tracker.</p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs mb-5 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="ID Document Unclear">ID document or photo is unclear / ओळखपत्र अस्पष्ट आहे</option>
              <option value="Address Unverifiable">Address or shop details could not be verified / पत्ता पडताळणी झाली नाही</option>
              <option value="Jurisdiction Issue">Belongs to a different region / हे क्षेत्र दुसऱ्या विभागाचे आहे</option>
              <option value="Invalid Application">Ineligible or duplicate registration / अपात्र किंवा दुबार अर्ज</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setRejectingRef(null)}
                disabled={actionLoading}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectingRef, 'reject', rejectReason)}
                disabled={actionLoading}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
