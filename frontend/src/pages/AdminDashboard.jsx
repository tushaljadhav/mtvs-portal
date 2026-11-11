import React, { useState, useEffect } from 'react';
import { 
  fetchAdminStats, 
  fetchAdminRequests, 
  decideRequest, 
  fetchAllAreas, 
  fetchRegionsWithAreas, 
  createRegion, 
  createArea, 
  deleteArea, 
  changeAdminPassword 
} from '../api';
import { 
  Users, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  KeyRound, 
  RefreshCw, 
  IdCard, 
  ShieldAlert, 
  Building 
} from 'lucide-react';

export default function AdminDashboard({ admin, onViewPass }) {
  const [activeTab, setActiveTab] = useState('requests'); // 'overview' | 'requests' | 'members' | 'masters' | 'settings'
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [areas, setAreas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters for Members Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectingRef, setRejectingRef] = useState(null);
  const [rejectReason, setRejectReason] = useState('idUnclear');
  
  // Area Master Modals
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [newArea, setNewArea] = useState({ name: '', region_id: '', lat: '', lng: '' });
  
  const [showAddRegionModal, setShowAddRegionModal] = useState(false);
  const [newRegion, setNewRegion] = useState({ name: '', name_mr: '', approver: '', phone: '' });

  // Settings
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [s, r, a, reg] = await Promise.all([
        fetchAdminStats().catch(() => ({})),
        fetchAdminRequests(),
        fetchAllAreas().catch(() => []),
        fetchRegionsWithAreas().catch(() => [])
      ]);
      setStats(s);
      setRequests(r);
      setAreas(a);
      setRegions(reg);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Approve / Reject / Pay
  const handleAction = async (ref, action, reason = null) => {
    try {
      await decideRequest(ref, action, reason);
      await loadData();
      if (selectedRequest?.ref === ref) {
        setSelectedRequest(null);
      }
      if (rejectingRef) {
        setRejectingRef(null);
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  // Add Area Submit
  const handleAddArea = async (e) => {
    e.preventDefault();
    if (!newArea.name || !newArea.region_id) return;
    try {
      await createArea(newArea);
      setShowAddAreaModal(false);
      setNewArea({ name: '', region_id: '', lat: '', lng: '' });
      await loadData();
    } catch (err) {
      alert('Failed to add area: ' + err.message);
    }
  };

  // Delete Area
  const handleDeleteArea = async (id) => {
    if (!confirm('Are you sure you want to delete this area?')) return;
    try {
      await deleteArea(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete area: ' + err.message);
    }
  };

  // Add Region Submit
  const handleAddRegion = async (e) => {
    e.preventDefault();
    if (!newRegion.name || !newRegion.approver || !newRegion.phone) return;
    try {
      await createRegion(newRegion);
      setShowAddRegionModal(false);
      setNewRegion({ name: '', name_mr: '', approver: '', phone: '' });
      await loadData();
    } catch (err) {
      alert('Failed to add region: ' + err.message);
    }
  };

  // Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    try {
      await changeAdminPassword(pwdForm.current, pwdForm.newPwd);
      setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
      setPwdForm({ current: '', newPwd: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message || 'Failed to update password' });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const paidMembers = requests.filter(r => r.status === 'paid');
    const headers = ['Member ID', 'Name', 'Phone', 'Area', 'Shop', 'Work Type', 'Issue Date', 'Receipt No'];
    const rows = paidMembers.map(m => [
      m.member_id,
      m.name,
      m.phone,
      m.area,
      m.shop,
      m.work_type,
      new Date(m.paid_at).toLocaleDateString('en-IN'),
      m.receipt_no
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(i => `"${i||''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MTVS_Members_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Filtered Members
  const paidMembers = requests.filter(r => r.status === 'paid');
  const filteredMembers = paidMembers.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.phone.includes(q) || (m.member_id || '').toLowerCase().includes(q);
    const matchArea = !selectedAreaFilter || m.area === selectedAreaFilter;
    return matchQ && matchArea;
  });

  // Pending and Approved requests for Approval Workflow
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'approved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              MTVS Administrative Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Session
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <strong>{admin?.name}</strong> ({admin?.email}) • Region: {admin?.region || 'All Mumbai (Super Admin)'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Members</span>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800">
            {stats?.paid || 0}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Active Verified Cards
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {stats?.pending || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Awaiting Approver Action
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved / Unpaid</span>
            <CreditCard className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">
            {stats?.approved || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            ₹100 Payment Pending
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-700">
            ₹{(stats?.paid || 0) * 100}
          </div>
          <div className="text-xs text-teal-600 font-semibold mt-1">
            ₹100 / Member Subscriptions
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'requests', label: 'Joining Requests', icon: Clock, count: pendingRequests.length },
          { id: 'members', label: 'Members Directory', icon: Users, count: paidMembers.length },
          { id: 'masters', label: 'Area Masters', icon: MapPin, count: areas.length },
          { id: 'settings', label: 'Security & Profile', icon: KeyRound },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {t.label}
              {t.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: JOINING REQUESTS (APPROVAL WORKFLOW) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">
              Applications Requiring Action ({pendingRequests.length})
            </h2>
            <div className="text-xs text-slate-400">
              Review documents, verify shop identity, then Approve or Reject.
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Shop & Trade</th>
                    <th className="py-3 px-4">Area / Ward</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 text-sm">
                        No pending applications at this time. All caught up! 🎉
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map(r => (
                      <tr key={r.ref} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-emerald-800 text-xs">
                              {r.photo_url ? (
                                <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                r.name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{r.name}</div>
                              <div className="text-xs text-slate-500 font-mono">+91 {r.phone} • {r.ref}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-700">{r.shop}</div>
                          <div className="text-xs text-slate-400">{r.work_type}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{r.area}</span>
                          <span className="text-xs text-slate-400 block">{r.pincode}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          {r.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <CreditCard className="w-3 h-3" /> Waiting for Payment
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRequest(r)}
                              title="View Application Details"
                              className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Details
                            </button>

                            {r.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAction(r.ref, 'approve')}
                                  className="p-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectingRef(r.ref)}
                                  className="p-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </>
                            )}

                            {r.status === 'approved' && (
                              <button
                                onClick={() => handleAction(r.ref, 'pay')}
                                className="p-1.5 px-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Mark Paid
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
        </div>
      )}

      {/* TAB 2: MEMBERS DIRECTORY (TABLE WITH TAILWIND) */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, phone, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedAreaFilter}
                onChange={(e) => setSelectedAreaFilter(e.target.value)}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Areas ({areas.length})</option>
                {areas.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Member ID</th>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Shop & Trade</th>
                    <th className="py-3 px-4">Area / Ward</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Card Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                        No members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map(m => (
                      <tr key={m.member_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-xs">
                          {m.member_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{m.name}</div>
                          <div className="text-xs text-slate-400 font-mono">+91 {m.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 font-medium">{m.shop}</span>
                          <span className="text-xs text-slate-400 block">{m.work_type}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">{m.area}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {new Date(m.paid_at || m.submitted_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onViewPass(m.member_id)}
                            className="p-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                          >
                            <IdCard className="w-3.5 h-3.5 text-emerald-700" />
                            View Pass
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DYNAMIC AREA MASTERS */}
      {activeTab === 'masters' && (
        <div className="space-y-8">
          {/* Areas Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Area & Ward Masters ({areas.length})
                </h2>
                <p className="text-xs text-slate-500">
                  New areas added here immediately appear in the public registration dropdown.
                </p>
              </div>

              <button
                onClick={() => setShowAddAreaModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Area
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Area Name</th>
                      <th className="py-3 px-4">Region Assigned</th>
                      <th className="py-3 px-4">Representative / Approver</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {areas.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {a.name}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          {a.region_name}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {a.approver}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-500">
                          +91 {a.phone}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteArea(a.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Area"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Regions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  Regional Divisions ({regions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Each region has an assigned representative responsible for membership approvals.
                </p>
              </div>

              <button
                onClick={() => setShowAddRegionModal(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Region
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {regions.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="font-extrabold text-slate-800 text-base mb-1">
                    {r.name}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mb-3">
                    {r.name_mr || 'विभागीय क्षेत्र'}
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                    <div className="text-slate-400">Approver:</div>
                    <div className="font-bold text-slate-800">{r.approver}</div>
                    <div className="text-slate-500 font-mono">+91 {r.phone}</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-2">
                      {r.areas?.length || 0} Areas Assigned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            Change Admin Password
          </h2>

          {pwdMsg.text && (
            <div className={`p-3 rounded-xl text-xs mb-4 ${
              pwdMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Password</label>
              <input
                type="password"
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password (min 8 chars)</label>
              <input
                type="password"
                minLength="8"
                value={pwdForm.newPwd}
                onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* MODAL: VIEW DETAILS */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border flex items-center justify-center font-bold text-lg">
                  {selectedRequest.photo_url ? (
                    <img src={selectedRequest.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedRequest.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{selectedRequest.name}</h4>
                  <div className="text-xs text-slate-500">{selectedRequest.ref} • {selectedRequest.gender}, {selectedRequest.age} yrs</div>
                  <div className="text-xs text-slate-600 font-mono">+91 {selectedRequest.phone}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
                <div><strong>Shop / Trade:</strong> {selectedRequest.shop} ({selectedRequest.work_type})</div>
                <div><strong>Area:</strong> {selectedRequest.area} (Pin: {selectedRequest.pincode})</div>
                <div><strong>Address:</strong> {selectedRequest.address}</div>
                <div><strong>ID Document:</strong> {selectedRequest.id_type} {selectedRequest.id_number ? `(${selectedRequest.id_number})` : ''}</div>
              </div>

              {/* Action buttons inside modal */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleAction(selectedRequest.ref, 'approve')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      setRejectingRef(selectedRequest.ref);
                      setSelectedRequest(null);
                    }}
                    className="py-2.5 px-4 bg-rose-50 text-rose-700 font-bold rounded-xl text-sm hover:bg-rose-100"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT REASON */}
      {rejectingRef && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Select Rejection Reason</h3>
            <p className="text-xs text-slate-500 mb-4">The applicant will see this explanation on their status tracker.</p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="idUnclear">The ID document is not clear / फोटो किंवा ओळखपत्र अस्पष्ट आहे</option>
              <option value="detailsBad">Details could not be confirmed / माहिती पडताळणी झाली नाही</option>
              <option value="wrongArea">Belongs to a different region / हे क्षेत्र दुसऱ्या विभागाचे आहे</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setRejectingRef(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(rejectingRef, 'reject', rejectReason)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD AREA */}
      {showAddAreaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Area / Ward</h3>
              <button onClick={() => setShowAddAreaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddArea} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Area Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kandivali, Vashi, Sion..."
                  value={newArea.name}
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign to Region *</label>
                <select
                  value={newArea.region_id}
                  onChange={(e) => setNewArea({ ...newArea, region_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select Region</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.approver})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Latitude (opt)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="19.1234"
                    value={newArea.lat}
                    onChange={(e) => setNewArea({ ...newArea, lat: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Longitude (opt)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="72.8567"
                    value={newArea.lng}
                    onChange={(e) => setNewArea({ ...newArea, lng: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAreaModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-sm"
                >
                  Save Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD REGION */}
      {showAddRegionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Region</h3>
              <button onClick={() => setShowAddRegionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRegion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Region Name (English) *</label>
                <input
                  type="text"
                  placeholder="e.g. Navi Mumbai, Palghar..."
                  value={newRegion.name}
                  onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Region Name (Marathi)</label>
                <input
                  type="text"
                  placeholder="नवी मुंबई"
                  value={newRegion.name_mr}
                  onChange={(e) => setNewRegion({ ...newRegion, name_mr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-devanagari"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Approver Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Joshi"
                  value={newRegion.approver}
                  onChange={(e) => setNewRegion({ ...newRegion, approver: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Approver Phone Number *</label>
                <input
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={newRegion.phone}
                  onChange={(e) => setNewRegion({ ...newRegion, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRegionModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-sm"
                >
                  Save Region
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
