import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import { getStoredAdmin, getToken, clearToken, fetchAdminStats } from '../../api';

export default function AdminLayout({ admin, setAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);

  // Authentication check
  useEffect(() => {
    const token = getToken();
    const stored = getStoredAdmin();
    if (!token || !stored) {
      navigate('/admin/login', { replace: true });
    } else if (!admin) {
      setAdmin(stored);
    }
  }, [admin, navigate, setAdmin]);

  // Listen for global 401 unauthorized events from api.js
  useEffect(() => {
    const handleUnauthorized = () => {
      clearToken();
      setAdmin(null);
      navigate('/admin/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate, setAdmin]);

  // Load summary stats for badges
  const loadStats = useCallback(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (getToken()) {
      loadStats();
    }
  }, [location.pathname, loadStats]);

  if (!getToken()) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <AdminNavbar
        admin={admin || getStoredAdmin()}
        onLogout={() => setAdmin(null)}
        pendingCount={stats?.pending || 0}
      />
      
      {/* Full-width container for desktop dashboard */}
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet context={{ stats, refreshStats: loadStats }} />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-[1700px] mx-auto px-4">
          Mumbai Vidi Tambakhu Sangh • Enterprise Administrative Control Panel • Secured Access
        </div>
      </footer>
    </div>
  );
}
