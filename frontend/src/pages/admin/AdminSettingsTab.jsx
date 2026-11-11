import React, { useState } from 'react';
import { changeAdminPassword, getStoredAdmin } from '../../api';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, User, Mail, MapPin, Eye, EyeOff } from 'lucide-react';

export default function AdminSettingsTab() {
  const admin = getStoredAdmin();
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirmPwd: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirmPwd: false });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (pwdForm.newPwd !== pwdForm.confirmPwd) {
      setMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }
    if (pwdForm.newPwd.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setLoading(true);
    try {
      await changeAdminPassword(pwdForm.current, pwdForm.newPwd);
      setMsg({ type: 'success', text: 'Password successfully updated! Keep your new password secure.' });
      setPwdForm({ current: '', newPwd: '', confirmPwd: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-emerald-700" />
          Security &amp; Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View administrator profile and update authentication credentials
        </p>
      </div>

      {/* Logged-in Admin Profile */}
      {admin && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
              {(admin.name || 'AD').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {admin.name}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {admin.email}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {admin.region ? `Region: ${admin.region}` : 'Super Admin (All Mumbai)'}
          </div>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
          Change Password
        </h2>

        {msg.text && (
          <div className={`p-4 rounded-2xl text-xs sm:text-sm mb-5 flex items-center gap-2.5 ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'current', label: 'Current Password *', minLength: undefined },
            { key: 'newPwd', label: 'New Password (min 8 characters) *', minLength: 8 },
            { key: 'confirmPwd', label: 'Confirm New Password *', minLength: 8 },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={showPwd[field.key] ? 'text' : 'password'}
                  minLength={field.minLength}
                  value={pwdForm[field.key]}
                  onChange={(e) => setPwdForm({ ...pwdForm, [field.key]: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd({ ...showPwd, [field.key]: !showPwd[field.key] })}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPwd[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
