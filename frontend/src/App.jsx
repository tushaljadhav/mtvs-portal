import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PublicNavbar from './components/PublicNavbar';
import RegisterPage from './pages/RegisterPage';
import StatusTrackerPage from './pages/StatusTrackerPage';
import PassPage from './pages/PassPage';
import TermsPage from './pages/TermsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardTab from './pages/admin/AdminDashboardTab';
import AdminMembersTab from './pages/admin/AdminMembersTab';
import AdminRequestsTab from './pages/admin/AdminRequestsTab';
import AdminGenerateLinkTab from './pages/admin/AdminGenerateLinkTab';
import AdminAdsTab from './pages/admin/AdminAdsTab';
import AdminAreasTab from './pages/admin/AdminAreasTab';
import AdminSettingsTab from './pages/admin/AdminSettingsTab';
import { getStoredAdmin } from './api';
import { LanguageProvider } from './context/LanguageContext';

// Public layout wrapper with public navbar and footer
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 text-center">
          © {new Date().getFullYear()} Mumbai Vidi Tambakhu Sangh (मुंबई विडी तंबाखू संघ) · Official Member Portal · All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [admin, setAdmin] = useState(getStoredAdmin());

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* ── PUBLIC ROUTES (Join Union, Track Status, Member Pass, Terms) ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<RegisterPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track" element={<StatusTrackerPage />} />
            <Route path="/track/:query" element={<StatusTrackerPage />} />
            <Route path="/pass/:memberId" element={<PassPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
          </Route>

          {/* ── ADMIN LOGIN ────────────────────────────────────────────── */}
          <Route
            path="/admin/login"
            element={<AdminLoginPage onLoggedIn={(a) => setAdmin(a)} />}
          />

          {/* Legacy redirect for old #login or /login */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* ── PROTECTED ADMIN ROUTES ─────────────────────────────────── */}
          <Route path="/admin" element={<AdminLayout admin={admin} setAdmin={setAdmin} />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardTab />} />
            <Route path="members" element={<AdminMembersTab />} />
            <Route path="requests" element={<AdminRequestsTab />} />
            <Route path="invite" element={<AdminGenerateLinkTab />} />
            <Route path="ads" element={<AdminAdsTab />} />
            <Route path="areas" element={<AdminAreasTab />} />
            <Route path="settings" element={<AdminSettingsTab />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
