import React, { useState, useEffect, useRef } from 'react';
import { 
  fetchAllAds, 
  createAd, 
  updateAd, 
  deleteAd 
} from '../../api';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Phone, 
  X, 
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminAdsTab() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [deletingAd, setDeletingAd] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const blobUrlRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    description_mr: '',
    phone: '',
    redirect_url: '',
    image_url: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    is_active: 1
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const loadAds = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllAds();
      setAds(data || []);
    } catch (err) {
      console.error('Failed to load ads:', err);
      setError(err.message || 'Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const resetPreviewBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const openCreateModal = () => {
    resetPreviewBlob();
    setEditingAd(null);
    setImageFile(null);
    setImagePreview(null);
    setForm({
      title: '',
      description: '',
      description_mr: '',
      phone: '',
      redirect_url: '',
      image_url: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      is_active: 1
    });
    setShowModal(true);
  };

  const openEditModal = (ad) => {
    resetPreviewBlob();
    setEditingAd(ad);
    setImageFile(null);
    setImagePreview(ad.image_url || null);
    setForm({
      title: ad.title || '',
      description: ad.description || '',
      description_mr: ad.description_mr || '',
      phone: ad.phone || '',
      redirect_url: ad.redirect_url || '',
      image_url: ad.image_url || '',
      start_date: ad.start_date ? String(ad.start_date).slice(0, 10) : '',
      end_date: ad.end_date ? String(ad.end_date).slice(0, 10) : '',
      is_active: ad.is_active ? 1 : 0
    });
    setShowModal(true);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image exceeds 5MB size limit', 'error');
        return;
      }
      resetPreviewBlob();
      const objUrl = URL.createObjectURL(file);
      blobUrlRef.current = objUrl;
      setImageFile(file);
      setImagePreview(objUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.start_date || !form.end_date) {
      showToast('Title, Start Date, and End Date are required', 'error');
      return;
    }
    if (form.end_date < form.start_date) {
      showToast('End Date cannot be earlier than Start Date', 'error');
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', form.title.trim());
      if (form.description) data.append('description', form.description.trim());
      if (form.description_mr) data.append('description_mr', form.description_mr.trim());
      if (form.phone) data.append('phone', form.phone.trim());
      if (form.redirect_url) data.append('redirect_url', form.redirect_url.trim());
      data.append('start_date', form.start_date);
      data.append('end_date', form.end_date);
      data.append('is_active', form.is_active ? '1' : '0');

      if (imageFile) {
        data.append('image', imageFile);
      } else if (form.image_url) {
        data.append('image_url', form.image_url.trim());
      }

      if (editingAd) {
        await updateAd(editingAd.id, data);
        showToast('Advertisement updated!');
      } else {
        await createAd(data);
        showToast('Advertisement created!');
      }
      setShowModal(false);
      await loadAds();
    } catch (err) {
      showToast('Failed to save advertisement: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ad) => {
    try {
      await updateAd(ad.id, { is_active: ad.is_active ? 0 : 1 });
      showToast(ad.is_active ? 'Advertisement paused' : 'Advertisement activated');
      await loadAds();
    } catch (err) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAd) return;
    setSaving(true);
    try {
      await deleteAd(deletingAd.id);
      setDeletingAd(null);
      showToast('Advertisement deleted');
      await loadAds();
    } catch (err) {
      showToast('Failed to delete ad: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getAdBadge = (ad) => {
    if (!ad.is_active) {
      return { label: 'Inactive', cls: 'bg-slate-100 text-slate-500 hover:bg-slate-200' };
    }
    const today = new Date().toISOString().slice(0, 10);
    const start = ad.start_date ? String(ad.start_date).slice(0, 10) : '';
    const end = ad.end_date ? String(ad.end_date).slice(0, 10) : '';
    if (end && end < today) {
      return { label: 'Expired', cls: 'bg-rose-100 text-rose-700 hover:bg-rose-200' };
    }
    if (start && start > today) {
      return { label: 'Scheduled', cls: 'bg-amber-100 text-amber-800 hover:bg-amber-200' };
    }
    return { label: 'Active ✓', cls: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' };
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-emerald-700" />
            Advertisement Master
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage partner advertisement banners, active date windows, and click-to-call/web links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Advertisement
          </button>
          <button
            onClick={loadAds}
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

      {/* Ads Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Banner Image</th>
                <th className="py-3.5 px-4 sm:px-6">Advertiser / Title</th>
                <th className="py-3.5 px-4 sm:px-6">Description (EN / Marathi)</th>
                <th className="py-3.5 px-4 sm:px-6">Click Target</th>
                <th className="py-3.5 px-4 sm:px-6">Date Range</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400 text-sm">
                    {loading ? 'Loading advertisements...' : 'No advertisements configured.'}
                  </td>
                </tr>
              ) : (
                ads.map(ad => {
                  const sDate = ad.start_date ? new Date(ad.start_date).toLocaleDateString('en-IN') : '—';
                  const eDate = ad.end_date ? new Date(ad.end_date).toLocaleDateString('en-IN') : '—';
                  const badge = getAdBadge(ad);
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Image Thumbnail */}
                      <td className="py-3.5 px-4 sm:px-6">
                        {ad.image_url ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-extrabold text-slate-900 text-sm">{ad.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: #{ad.id}</div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <div className="text-xs text-slate-800 line-clamp-1">{ad.description || '—'}</div>
                        <div className="text-[11px] text-slate-500 font-devanagari line-clamp-1 mt-0.5">
                          {ad.description_mr || '—'}
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-xs">
                        {ad.phone && (
                          <div className="font-mono font-bold text-slate-700 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> +91 {ad.phone}
                          </div>
                        )}
                        {ad.redirect_url && (
                          <a
                            href={ad.redirect_url.startsWith('http') ? ad.redirect_url : `https://${ad.redirect_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5 max-w-[160px] truncate"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{ad.redirect_url}</span>
                          </a>
                        )}
                        {!ad.phone && !ad.redirect_url && <span className="text-slate-400">—</span>}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-600">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sDate} → {eDate}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        <button
                          onClick={() => handleToggleActive(ad)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${badge.cls}`}
                          title="Click to toggle active/inactive"
                        >
                          {badge.label}
                        </button>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(ad)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAd(ad)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT ADVERTISEMENT */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingAd ? 'Edit Advertisement' : 'Add New Advertisement'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Advertisement Image / Banner
                </label>
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-emerald-500 shadow-2xs flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Or enter image URL (https://...)"
                      value={form.image_url}
                      onChange={(e) => {
                        setForm({ ...form, image_url: e.target.value });
                        if (!imageFile) setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Advertiser Title / Agency Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patil Bidi Works"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description (English)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Authorized distributor for Western Mumbai..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description (Marathi / देवनागरी)
                </label>
                <textarea
                  rows="2"
                  placeholder="उदा. पश्चिम मुंबईचे अधिकृत वितरक..."
                  value={form.description_mr}
                  onChange={(e) => setForm({ ...form, description_mr: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-devanagari"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Contact Phone (Click to Call)
                  </label>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Web Link (Click to Redirect)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.redirect_url || ''}
                    onChange={(e) => setForm({ ...form, redirect_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* DATE RANGE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    min={form.start_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ad_active_box"
                  checked={form.is_active === 1}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="ad_active_box" className="text-xs font-bold text-slate-700">
                  Ad is Active (display on member pass &amp; landing page)
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {saving ? 'Saving...' : editingAd ? 'Save Changes' : 'Create Advertisement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingAd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Advertisement?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to permanently remove <strong>{deletingAd.title}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingAd(null)}
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
                {saving ? 'Deleting...' : 'Delete Ad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
