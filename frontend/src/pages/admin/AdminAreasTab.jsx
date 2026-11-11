import React, { useState, useEffect } from 'react';
import { 
  fetchAllAreas, 
  fetchRegionsWithAreas, 
  createRegion,
  updateRegion,
  deleteRegion,
  createArea,
  updateArea,
  deleteArea 
} from '../../api';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit,
  Building, 
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminAreasTab() {
  const [areas, setAreas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Add / Edit Area Modal
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [areaForm, setAreaForm] = useState({ name: '', region_id: '', lat: '', lng: '' });

  // Add / Edit Region Modal
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionForm, setRegionForm] = useState({ name: '', name_mr: '', approver: '', phone: '' });

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'area' | 'region', item }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, r] = await Promise.all([
        fetchAllAreas(),
        fetchRegionsWithAreas()
      ]);
      setAreas(a || []);
      setRegions(r || []);
    } catch (err) {
      console.error('Failed to load masters:', err);
      setError(err.message || 'Failed to load area and region masters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddArea = () => {
    setEditingArea(null);
    setAreaForm({ name: '', region_id: regions[0]?.id || '', lat: '', lng: '' });
    setShowAreaModal(true);
  };

  const openEditArea = (area) => {
    setEditingArea(area);
    setAreaForm({
      name: area.name || '',
      region_id: area.region_id || '',
      lat: area.lat ?? '',
      lng: area.lng ?? ''
    });
    setShowAreaModal(true);
  };

  const handleSaveArea = async (e) => {
    e.preventDefault();
    if (!areaForm.name.trim() || !areaForm.region_id) return;
    setSaving(true);
    try {
      if (editingArea) {
        await updateArea(editingArea.id, areaForm);
        showToast(`Area "${areaForm.name.trim()}" updated`);
      } else {
        await createArea(areaForm);
        showToast(`Area "${areaForm.name.trim()}" added`);
      }
      setShowAreaModal(false);
      await loadData();
    } catch (err) {
      showToast('Failed to save area: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openAddRegion = () => {
    setEditingRegion(null);
    setRegionForm({ name: '', name_mr: '', approver: '', phone: '' });
    setShowRegionModal(true);
  };

  const openEditRegion = (region) => {
    setEditingRegion(region);
    setRegionForm({
      name: region.name || '',
      name_mr: region.name_mr || '',
      approver: region.approver || '',
      phone: region.phone || ''
    });
    setShowRegionModal(true);
  };

  const handleSaveRegion = async (e) => {
    e.preventDefault();
    if (!regionForm.name.trim() || !regionForm.approver.trim() || !regionForm.phone.trim()) return;
    setSaving(true);
    try {
      if (editingRegion) {
        await updateRegion(editingRegion.id, regionForm);
        showToast(`Region "${regionForm.name.trim()}" updated`);
      } else {
        await createRegion(regionForm);
        showToast(`Region "${regionForm.name.trim()}" added`);
      }
      setShowRegionModal(false);
      await loadData();
    } catch (err) {
      showToast('Failed to save region: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (deleteTarget.type === 'area') {
        await deleteArea(deleteTarget.item.id);
        showToast(`Area "${deleteTarget.item.name}" deleted`);
      } else {
        await deleteRegion(deleteTarget.item.id);
        showToast(`Region "${deleteTarget.item.name}" deleted`);
      }
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
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
            <MapPin className="w-6 h-6 text-emerald-700" />
            Dynamic Area &amp; Ward Masters
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure wards, geographic zones, map coordinates, and union approving representatives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddArea}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Area
          </button>
          <button
            onClick={openAddRegion}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Add Region
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Areas Table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-800">
            Active Areas &amp; Wards ({areas.length})
          </h2>
          <span className="text-xs text-slate-400">
            Available in member registration dropdown
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Area Name</th>
                  <th className="py-3.5 px-4 sm:px-6">Assigned Region</th>
                  <th className="py-3.5 px-4 sm:px-6">Union Representative</th>
                  <th className="py-3.5 px-4 sm:px-6">Contact Phone</th>
                  <th className="py-3.5 px-4 sm:px-6">Map Coords</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {areas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                      {loading ? 'Loading areas...' : 'No areas configured yet.'}
                    </td>
                  </tr>
                ) : (
                  areas.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        {a.name}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-emerald-700 text-xs sm:text-sm">
                        {a.region_name}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-700 text-xs sm:text-sm font-medium">
                        {a.approver}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-xs font-mono text-slate-500">
                        +91 {a.phone}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-[11px] font-mono text-slate-400">
                        {a.lat && a.lng ? `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}` : 'Default'}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditArea(a)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Area"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'area', item: a })}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Area"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Regions Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-600" />
          Regional Divisions ({regions.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regions.map(r => (
            <div key={r.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-extrabold text-slate-900 text-base mb-0.5">
                    {r.name}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditRegion(r)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                      title="Edit Region"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'region', item: r })}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Region"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-emerald-700 font-semibold mb-3 font-devanagari">
                  {r.name_mr || 'विभागीय क्षेत्र'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1">
                <div className="text-slate-400">Approver:</div>
                <div className="font-bold text-slate-800">{r.approver}</div>
                <div className="text-slate-500 font-mono">+91 {r.phone}</div>
                <div className="text-[11px] text-emerald-700 font-bold mt-2 pt-2 border-t border-slate-100">
                  {r.areas?.length || 0} Areas Assigned
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD / EDIT AREA */}
      {showAreaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingArea ? 'Edit Area / Ward' : 'Add New Area / Ward'}
              </h3>
              <button onClick={() => setShowAreaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Area Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kandivali, Vashi, Sion..."
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign to Region *</label>
                <select
                  value={areaForm.region_id}
                  onChange={(e) => setAreaForm({ ...areaForm, region_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Latitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="19.0760"
                    value={areaForm.lat}
                    onChange={(e) => setAreaForm({ ...areaForm, lat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Longitude (Optional)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="72.8777"
                    value={areaForm.lng}
                    onChange={(e) => setAreaForm({ ...areaForm, lng: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAreaModal(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingArea ? 'Save Changes' : 'Save Area'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT REGION */}
      {showRegionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingRegion ? 'Edit Region' : 'Add New Region'}
              </h3>
              <button onClick={() => setShowRegionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Region Name (English) *</label>
                <input
                  type="text"
                  placeholder="e.g. Navi Mumbai, Palghar..."
                  value={regionForm.name}
                  onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Region Name (Marathi)</label>
                <input
                  type="text"
                  placeholder="नवी मुंबई"
                  value={regionForm.name_mr}
                  onChange={(e) => setRegionForm({ ...regionForm, name_mr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-devanagari"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Approver Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Joshi"
                  value={regionForm.approver}
                  onChange={(e) => setRegionForm({ ...regionForm, approver: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Approver Phone Number *</label>
                <input
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={regionForm.phone}
                  onChange={(e) => setRegionForm({ ...regionForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowRegionModal(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingRegion ? 'Save Changes' : 'Save Region'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete {deleteTarget.type === 'area' ? 'Area' : 'Region'}?
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove <strong>{deleteTarget.item.name}</strong>?
              {deleteTarget.type === 'region' && ' Regions with assigned areas must be emptied first.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={saving}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
